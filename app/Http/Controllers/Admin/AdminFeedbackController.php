<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminFeedbackController extends Controller
{
    /**
     * Display all feedbacks with filtering and search
     */
    public function index(Request $request): Response
    {
        $query = Feedback::with('user')->orderBy('created_at', 'desc');

        // Filter by type
        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->withStatus($request->status);
        }

        // Search functionality
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        $feedbacks = $query->paginate(15)->withQueryString();

        // Count statistics
        $stats = [
            'total' => Feedback::count(),
            'new' => Feedback::where('status', 'new')->count(),
            'in_progress' => Feedback::where('status', 'in_progress')->count(),
            'resolved' => Feedback::where('status', 'resolved')->count(),
        ];

        return Inertia::render('Admin/Feedback/Index', [
            'feedbacks' => $feedbacks,
            'filters' => $request->only(['type', 'status', 'search']),
            'stats' => $stats,
            'feedbackTypes' => [
                'suggestion' => 'اقتراح',
                'bug' => 'مشكلة تقنية',
                'question' => 'استفسار'
            ],
            'statuses' => [
                'new' => 'جديد',
                'in_progress' => 'قيد المراجعة',
                'resolved' => 'تم الحل'
            ]
        ]);
    }

    /**
     * Show a specific feedback
     */
    public function show(Feedback $feedback): Response
    {
        // Mark as read by admin
        if (!$feedback->is_read_by_admin) {
            $feedback->update(['is_read_by_admin' => true]);
        }

        return Inertia::render('Admin/Feedback/Show', [
            'feedback' => $feedback->load('user')
        ]);
    }

    /**
     * Update feedback status
     */
    public function updateStatus(Request $request, Feedback $feedback): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:new,in_progress,resolved',
        ]);

        $feedback->update([
            'status' => $request->status,
            'is_read_by_admin' => true,
        ]);

        return redirect()->back()->with('success', 'تم تحديث حالة التعليق بنجاح');
    }

    /**
     * Reply to feedback
     */
    public function reply(Request $request, Feedback $feedback): RedirectResponse
    {
        $request->validate([
            'reply' => 'required|string|min:5|max:1000',
        ], [
            'reply.required' => 'الرد مطلوب',
            'reply.min' => 'الرد يجب أن يكون 5 أحرف على الأقل',
            'reply.max' => 'الرد يجب ألا يزيد عن 1000 حرف',
        ]);

        $feedback->update([
            'reply' => $request->reply,
            'responded_at' => now(),
            'is_read_by_admin' => true,
            'status' => $feedback->status === 'new' ? 'in_progress' : $feedback->status,
        ]);

        return redirect()->back()->with('success', 'تم إرسال الرد بنجاح');
    }

    /**
     * Delete feedback
     */
    public function destroy(Feedback $feedback): RedirectResponse
    {
        $feedback->delete();
        
        return redirect()->route('admin.feedback.index')->with('success', 'تم حذف التعليق بنجاح');
    }

    /**
     * Bulk update status for multiple feedbacks
     */
    public function bulkUpdateStatus(Request $request): RedirectResponse
    {
        $request->validate([
            'feedback_ids' => 'required|array',
            'feedback_ids.*' => 'exists:feedbacks,id',
            'status' => 'required|in:new,in_progress,resolved',
        ]);

        Feedback::whereIn('id', $request->feedback_ids)
            ->update([
                'status' => $request->status,
                'is_read_by_admin' => true,
            ]);

        $count = count($request->feedback_ids);
        return redirect()->back()->with('success', "تم تحديث حالة {$count} تعليق بنجاح");
    }
}
