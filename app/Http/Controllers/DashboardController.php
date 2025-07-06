<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Student;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Group;
use App\Models\GroupSpecialSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{

    const TEACHER = 'teacher';
    const ASSISTANT = 'assistant';
    



    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        if ($user->is_admin) {
            return $this->adminDashboard();
        }
        
        if ($user->type === 'assistant') {
            return $this->assistantDashboard($user);
        }
        
        return $this->teacherDashboard($user);
    }
    
    /**
     * Admin dashboard with system reports.
     */
    private function adminDashboard(): Response
    {
        $totalTeachers = User::where('is_admin', false)
        ->where('type', self::TEACHER) // Exclude assistants
        ;
        // System statistics
        $approvedTeachers = $totalTeachers->where('is_approved', true)->count();
        $pendingTeachers = $totalTeachers->where('is_approved', false)->count();
        $totalTeachers = $totalTeachers->count();
       
        $totalStudents = Student::count();
        
        // Plan statistics
        $planStats = Plan::withCount('subscriptions')
            ->get()
            ->map(function ($plan) {
                return [
                    'name'          => $plan->name,
                    'max_students'  => $plan->max_students,
                    'price'        => $plan->formatted_price,
                    'subscribers'  => $plan->subscriptions_count,
                    'is_default'   => $plan->is_default,
                ];
            });
        
        // Recent activity
        $recentUsers = User::where('is_admin', false)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email', 'is_approved', 'created_at']);
        
        // Usage statistics
        $usageStats = User::where('is_admin', false)
        // ->where('type', self::TEACHER) // Exclude assistants
            ->where('is_approved', true)
            ->with(['students', 'activeSubscription.plan'])
            ->get()
            ->map(function ($user) {
                $subscription = $user->activeSubscription;
                $maxStudents = $subscription && $subscription->plan ? $subscription->plan->max_students : 0;
                return [
                    'student_count' => $user->students->count(),
                    'max_students' => $maxStudents,
                    'plan_name' => $subscription && $subscription->plan ? $subscription->plan->name : 'No Plan',
                ];
            });
        
        return Inertia::render('Admin/Dashboard', [
            'systemStats' => [
                'total_users' => $totalTeachers,
                'approved_users' => $approvedTeachers,
                'pending_users' => $pendingTeachers,
                'total_students' => $totalStudents,
            ],
            'planStats' => $planStats,
            'recentUsers' => $recentUsers,
            'usageStats' => $usageStats,
        ]);
    }
    
    /**
     * Teacher dashboard with subscription info.
     */
    private function teacherDashboard(User $user): Response
    {
        $subscriptionLimits = $user->getSubscriptionLimits();
        $currentStudentCount = $user->getStudentCount();
        $availablePlans = Plan::where('max_students', '>', $subscriptionLimits['max_students'])
            ->orderBy('max_students')
            ->get();
        
        return Inertia::render('Dashboard', [
            'subscriptionLimits' => $subscriptionLimits,
            'currentStudentCount' => $currentStudentCount,
            'canAddStudents' => $user->canAddStudents(),
            'availablePlans' => $availablePlans,
        ]);
    }
    
    /**
     * Assistant dashboard with limited information.
     */
    private function assistantDashboard(User $user): Response
    {
        // Get the main teacher
        $teacher = $user->teacher;
        
        if (!$teacher) {
            return Inertia::render('Dashboard', [
                'error' => 'No teacher found for this assistant',
            ]);
        }
        
        $subscriptionLimits = $teacher->getSubscriptionLimits();
        $currentStudentCount = $teacher->getStudentCount();
        
        return Inertia::render('Dashboard', [
            'subscriptionLimits' => $subscriptionLimits,
            'currentStudentCount' => $currentStudentCount,
            'canAddStudents' => false, // Assistants can't add students directly
            'availablePlans' => [], // Assistants don't need to see upgrade options
            'isAssistant' => true,
            'teacherName' => $teacher->name,
        ]);
    }

    /**
     * Display teacher's calendar view
     */
    public function calendar(): Response
    {
        $user = Auth::user();
        
        // Get all groups with schedules and special sessions
        $groups = Group::where('user_id', $user->id)
            ->with(['schedules', 'specialSessions'])
            ->get();
        
        return Inertia::render('Dashboard/Calendar', [
            'groups' => $groups,
        ]);
    }

    /**
     * Get all calendar events for the teacher
     */
    public function getCalendarEvents(Request $request)
    {
        $user = Auth::user();
        $start = $request->input('start');
        $end = $request->input('end');

        $events = [];

        // Get all teacher's groups
        $groups = Group::where('user_id', $user->id)->with(['schedules', 'specialSessions'])->get();

        foreach ($groups as $group) {
            // Add recurring schedule events
            if ($start && $end) {
                $startDate = new \DateTime($start);
                $endDate = new \DateTime($end);
                
                while ($startDate <= $endDate) {
                    $dayOfWeek = (int) $startDate->format('w'); // 0 = Sunday, 6 = Saturday
                    
                    foreach ($group->schedules as $schedule) {
                        if ($schedule->day_of_week == $dayOfWeek) {
                            $events[] = [
                                'id' => 'schedule_' . $schedule->id . '_' . $startDate->format('Y-m-d'),
                                'title' => $group->name,
                                'start' => $startDate->format('Y-m-d') . 'T' . $schedule->start_time,
                                'end' => $startDate->format('Y-m-d') . 'T' . $schedule->end_time,
                                'backgroundColor' => '#3b82f6',
                                'borderColor' => '#2563eb',
                                'extendedProps' => [
                                    'type' => 'recurring',
                                    'groupId' => $group->id,
                                    'groupName' => $group->name,
                                    'sessionType' => 'جلسة عادية'
                                ],
                                'editable' => false
                            ];
                        }
                    }
                    
                    $startDate->modify('+1 day');
                }
            }

            // Add special session events
            $specialSessions = $group->specialSessions()
                ->when($start, function($query) use ($start) {
                    $query->where('date', '>=', $start);
                })
                ->when($end, function($query) use ($end) {
                    $query->where('date', '<=', $end);
                })
                ->get();

            foreach ($specialSessions as $session) {
                $events[] = [
                    'id' => 'special_' . $session->id,
                    'title' => $group->name . ' - خاص',
                    'start' => $session->date->format('Y-m-d') . 'T' . $session->start_time,
                    'end' => $session->date->format('Y-m-d') . 'T' . $session->end_time,
                    'backgroundColor' => '#10b981',
                    'borderColor' => '#059669',
                    'extendedProps' => [
                        'description' => $session->description,
                        'type' => 'special',
                        'groupId' => $group->id,
                        'groupName' => $group->name,
                        'sessionType' => 'جلسة خاصة',
                        'sessionId' => $session->id
                    ],
                    'editable' => false
                ];
            }
        }

        return response()->json($events);
    }

    /**
     * Get today's sessions for the teacher
     */
    public function getTodaySessions()
    {
        $user = Auth::user();
        $today = now()->format('Y-m-d');
        $dayOfWeek = (int) now()->format('w');

        $sessions = [];

        // Get all teacher's groups
        $groups = Group::where('user_id', $user->id)->with(['schedules', 'specialSessions'])->get();

        foreach ($groups as $group) {
            // Add today's recurring sessions
            foreach ($group->schedules as $schedule) {
                if ($schedule->day_of_week == $dayOfWeek) {
                    $sessions[] = [
                        'group_name' => $group->name,
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                        'type' => 'recurring',
                        'description' => 'جلسة عادية',
                        'group_id' => $group->id
                    ];
                }
            }

            // Add today's special sessions
            $todaySpecialSessions = $group->specialSessions()
                ->where('date', $today)
                ->get();

            foreach ($todaySpecialSessions as $session) {
                $sessions[] = [
                    'group_name' => $group->name,
                    'start_time' => $session->start_time,
                    'end_time' => $session->end_time,
                    'type' => 'special',
                    'description' => $session->description ?: 'جلسة خاصة',
                    'group_id' => $group->id
                ];
            }
        }

        // Sort sessions by start time
        usort($sessions, function($a, $b) {
            return strcmp($a['start_time'], $b['start_time']);
        });

        return response()->json($sessions);
    }

    /**
     * Reset all data for a new term
     */
    public function resetTerm(Request $request)
    {
        $request->validate([
            'confirmation' => 'required|string|in:CONFIRM RESET'
        ]);

        $user = Auth::user();

        // Don't allow admin users to reset data
        if ($user->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'المديرون لا يمكنهم إعادة تعيين البيانات.'
            ], 403);
        }

        try {
            DB::transaction(function () use ($user) {
                // Get all groups belonging to the user
                $groupIds = Group::where('user_id', $user->id)->pluck('id')->toArray();
                
                if (empty($groupIds)) {
                    // No groups to delete, but still return success
                    return;
                }

                // Get all students belonging to the user
                $studentIds = Student::where('user_id', $user->id)->pluck('id')->toArray();

                // Delete in proper order to avoid foreign key constraints
                
                // 1. Delete group special sessions
                if (!empty($groupIds)) {
                    GroupSpecialSession::whereIn('group_id', $groupIds)->delete();
                }

                // 2. Delete group schedules
                if (!empty($groupIds)) {
                    DB::table('group_schedules')->whereIn('group_id', $groupIds)->delete();
                }

                // 3. Delete attendances 
                if (!empty($groupIds)) {
                    DB::table('attendances')->whereIn('group_id', $groupIds)->delete();
                }

                // 4. Delete group_student pivot records
                if (!empty($groupIds)) {
                    DB::table('group_student')->whereIn('group_id', $groupIds)->delete();
                }

                // 5. Delete payments for user's students
                if (!empty($studentIds)) {
                    DB::table('payments')->whereIn('student_id', $studentIds)->delete();
                }

                // 6. Delete students (this will also cascade to related records)
                if (!empty($studentIds)) {
                    Student::whereIn('id', $studentIds)->delete();
                }

                // 7. Finally delete groups
                if (!empty($groupIds)) {
                    Group::whereIn('id', $groupIds)->delete();
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'تم إعادة تعيين جميع البيانات بنجاح. يمكنك الآن البدء في فصل دراسي جديد!'
            ]);

        } catch (\Exception $e) {
            Log::error('Term reset failed for user ' . $user->id . ': ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إعادة تعيين البيانات. يرجى المحاولة مرة أخرى.'
            ], 500);
        }
    }
}
