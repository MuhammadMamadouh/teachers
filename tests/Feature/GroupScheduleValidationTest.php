<?php

namespace Tests\Feature;

use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Models\Group;
use App\Models\GroupSchedule;
use App\Models\User;
use App\Models\AcademicYear;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class GroupScheduleValidationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $academicYear;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create([
            'type' => 'teacher',
            'is_approved' => true,
        ]);
        $this->academicYear = AcademicYear::factory()->create();
        Auth::login($this->user);
    }

    /** @test */
    public function it_detects_schedule_conflicts_during_creation()
    {
        // Create first group with schedule
        $firstGroup = Group::factory()->create([
            'user_id' => $this->user->id,
            'academic_year_id' => $this->academicYear->id,
        ]);
        
        GroupSchedule::create([
            'group_id' => $firstGroup->id,
            'day_of_week' => 1, // Monday
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        // Create a StoreGroupRequest instance
        $request = new StoreGroupRequest();
        $request->setContainer(app());
        
        // Set up the request data
        $data = [
            'name' => 'Test Group 2',
            'description' => 'Test description',
            'max_students' => 10,
            'is_active' => true,
            'payment_type' => 'monthly',
            'student_price' => 100,
            'academic_year_id' => $this->academicYear->id,
            'schedules' => [
                [
                    'day_of_week' => 1, // Monday
                    'start_time' => '11:00', // Overlaps with existing schedule
                    'end_time' => '13:00',
                ]
            ]
        ];

        $request->merge($data);

        // Create validator with the request rules
        $validator = Validator::make($data, $request->rules());
        
        // Apply the custom validation
        $request->withValidator($validator);

        $this->assertTrue($validator->fails());
        $this->assertStringContainsString('يوجد تعارض في الجدول الزمني', $validator->errors()->first('schedules.0.start_time'));
    }

    /** @test */
    public function it_allows_consecutive_schedules_without_overlap()
    {
        // Create first group with schedule
        $firstGroup = Group::factory()->create([
            'user_id' => $this->user->id,
            'academic_year_id' => $this->academicYear->id,
        ]);
        
        GroupSchedule::create([
            'group_id' => $firstGroup->id,
            'day_of_week' => 1, // Monday
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        // Create a StoreGroupRequest instance
        $request = new StoreGroupRequest();
        $request->setContainer(app());
        
        // Set up the request data
        $data = [
            'name' => 'Test Group 2',
            'description' => 'Test description',
            'max_students' => 10,
            'is_active' => true,
            'payment_type' => 'monthly',
            'student_price' => 100,
            'academic_year_id' => $this->academicYear->id,
            'schedules' => [
                [
                    'day_of_week' => 1, // Monday
                    'start_time' => '12:00', // Starts exactly when first ends
                    'end_time' => '14:00',
                ]
            ]
        ];

        $request->merge($data);

        // Create validator with the request rules
        $validator = Validator::make($data, $request->rules());
        
        // Apply the custom validation
        $request->withValidator($validator);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function it_allows_schedules_on_different_days()
    {
        // Create first group with schedule on Monday
        $firstGroup = Group::factory()->create([
            'user_id' => $this->user->id,
            'academic_year_id' => $this->academicYear->id,
        ]);
        
        GroupSchedule::create([
            'group_id' => $firstGroup->id,
            'day_of_week' => 1, // Monday
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        // Create a StoreGroupRequest instance
        $request = new StoreGroupRequest();
        $request->setContainer(app());
        
        // Set up the request data
        $data = [
            'name' => 'Test Group 2',
            'description' => 'Test description',
            'max_students' => 10,
            'is_active' => true,
            'payment_type' => 'monthly',
            'student_price' => 100,
            'academic_year_id' => $this->academicYear->id,
            'schedules' => [
                [
                    'day_of_week' => 2, // Tuesday
                    'start_time' => '10:00', // Same time but different day
                    'end_time' => '12:00',
                ]
            ]
        ];

        $request->merge($data);

        // Create validator with the request rules
        $validator = Validator::make($data, $request->rules());
        
        // Apply the custom validation
        $request->withValidator($validator);

        $this->assertFalse($validator->fails());
    }

    /** @test */
    public function it_detects_schedule_conflicts_during_update()
    {
        // Create first group with schedule
        $firstGroup = Group::factory()->create([
            'user_id' => $this->user->id,
            'academic_year_id' => $this->academicYear->id,
        ]);
        
        GroupSchedule::create([
            'group_id' => $firstGroup->id,
            'day_of_week' => 1, // Monday
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        // Create second group to update
        $secondGroup = Group::factory()->create([
            'user_id' => $this->user->id,
            'academic_year_id' => $this->academicYear->id,
        ]);

        // Test the validation logic directly
        $schedules = [
            [
                'day_of_week' => 1, // Monday
                'start_time' => '11:00', // Overlaps with first group
                'end_time' => '13:00',
            ]
        ];

        $conflictingSchedules = GroupSchedule::whereHas('group', function ($query) use ($secondGroup) {
            $query->where('user_id', $this->user->id)
                  ->where('id', '!=', $secondGroup->id); // Exclude current group
        })
        ->where('day_of_week', 1)
        ->where(function ($query) {
            $query->where(function ($q) {
                $q->where('start_time', '<=', '11:00')
                  ->where('end_time', '>', '11:00');
            })->orWhere(function ($q) {
                $q->where('start_time', '<', '13:00')
                  ->where('end_time', '>=', '13:00');
            })->orWhere(function ($q) {
                $q->where('start_time', '>=', '11:00')
                  ->where('end_time', '<=', '13:00');
            });
        })
        ->with('group')
        ->get();

        $this->assertTrue($conflictingSchedules->isNotEmpty());
        $this->assertEquals($firstGroup->id, $conflictingSchedules->first()->group_id);
    }

    /** @test */
    public function it_allows_group_to_keep_its_own_schedule_during_update()
    {
        // Create group with schedule
        $group = Group::factory()->create([
            'user_id' => $this->user->id,
            'academic_year_id' => $this->academicYear->id,
        ]);
        
        GroupSchedule::create([
            'group_id' => $group->id,
            'day_of_week' => 1, // Monday
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        // Test the validation logic directly - should not find conflicts with itself
        $conflictingSchedules = GroupSchedule::whereHas('group', function ($query) use ($group) {
            $query->where('user_id', $this->user->id)
                  ->where('id', '!=', $group->id); // Exclude current group
        })
        ->where('day_of_week', 1)
        ->where(function ($query) {
            $query->where(function ($q) {
                $q->where('start_time', '<=', '10:00')
                  ->where('end_time', '>', '10:00');
            })->orWhere(function ($q) {
                $q->where('start_time', '<', '12:00')
                  ->where('end_time', '>=', '12:00');
            })->orWhere(function ($q) {
                $q->where('start_time', '>=', '10:00')
                  ->where('end_time', '<=', '12:00');
            });
        })
        ->with('group')
        ->get();

        $this->assertTrue($conflictingSchedules->isEmpty());
    }

    /** @test */
    public function it_only_checks_conflicts_within_same_user_groups()
    {
        // Create another user
        $otherUser = User::factory()->create();
        
        // Create group for other user with schedule
        $otherGroup = Group::factory()->create([
            'user_id' => $otherUser->id,
            'academic_year_id' => $this->academicYear->id,
        ]);
        
        GroupSchedule::create([
            'group_id' => $otherGroup->id,
            'day_of_week' => 1, // Monday
            'start_time' => '10:00',
            'end_time' => '12:00',
        ]);

        // Create a StoreGroupRequest instance
        $request = new StoreGroupRequest();
        $request->setContainer(app());
        
        // Set up the request data
        $data = [
            'name' => 'Test Group',
            'description' => 'Test description',
            'max_students' => 10,
            'is_active' => true,
            'payment_type' => 'monthly',
            'student_price' => 100,
            'academic_year_id' => $this->academicYear->id,
            'schedules' => [
                [
                    'day_of_week' => 1, // Monday
                    'start_time' => '10:00', // Same as other user's schedule
                    'end_time' => '12:00',
                ]
            ]
        ];

        $request->merge($data);

        // Create validator with the request rules
        $validator = Validator::make($data, $request->rules());
        
        // Apply the custom validation
        $request->withValidator($validator);

        $this->assertFalse($validator->fails());
    }
}
