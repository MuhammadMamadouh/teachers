<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\GroupSchedule;
use App\Models\User;
use App\Models\AcademicYear;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GroupScheduleConflictTest extends TestCase
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
        $this->actingAs($this->user);
        
        // Mock subscription and other middleware
        $this->withoutMiddleware(['subscription', 'onboarding', 'approved', 'not-admin', 'scope-by-teacher']);
    }

    /** @test */
    public function it_prevents_creating_overlapping_schedules()
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

        // Try to create second group with overlapping schedule
        $response = $this->post(route('groups.store'), [
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
        ]);

        $response->assertSessionHasErrors('schedules.0.start_time');
        $this->assertStringContainsString('يوجد تعارض في الجدول الزمني', session('errors')->first('schedules.0.start_time'));
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

        // Create second group with consecutive schedule (no overlap)
        $response = $this->post(route('groups.store'), [
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
        ]);

        $response->assertRedirect(route('groups.index'));
        $response->assertSessionHas('success');
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

        // Create second group with schedule on Tuesday (different day)
        $response = $this->post(route('groups.store'), [
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
        ]);

        $response->assertRedirect(route('groups.index'));
        $response->assertSessionHas('success');
    }

    /** @test */
    public function it_allows_updating_group_without_schedule_conflicts()
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

        // Create second group
        $secondGroup = Group::factory()->create([
            'user_id' => $this->user->id,
            'academic_year_id' => $this->academicYear->id,
        ]);

        // Update second group with non-conflicting schedule
        $response = $this->put(route('groups.update', $secondGroup), [
            'name' => 'Updated Group',
            'description' => 'Updated description',
            'max_students' => 15,
            'is_active' => true,
            'payment_type' => 'monthly',
            'student_price' => 150,
            'academic_year_id' => $this->academicYear->id,
            'schedules' => [
                [
                    'day_of_week' => 1, // Monday
                    'start_time' => '14:00', // No overlap with first group
                    'end_time' => '16:00',
                ]
            ]
        ]);

        $response->assertRedirect(route('groups.index'));
        $response->assertSessionHas('success');
    }

    /** @test */
    public function it_prevents_updating_group_with_conflicting_schedules()
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

        // Create second group
        $secondGroup = Group::factory()->create([
            'user_id' => $this->user->id,
            'academic_year_id' => $this->academicYear->id,
        ]);

        // Try to update second group with conflicting schedule
        $response = $this->put(route('groups.update', $secondGroup), [
            'name' => 'Updated Group',
            'description' => 'Updated description',
            'max_students' => 15,
            'is_active' => true,
            'payment_type' => 'monthly',
            'student_price' => 150,
            'academic_year_id' => $this->academicYear->id,
            'schedules' => [
                [
                    'day_of_week' => 1, // Monday
                    'start_time' => '11:00', // Overlaps with first group
                    'end_time' => '13:00',
                ]
            ]
        ]);

        $response->assertSessionHasErrors('schedules.0.start_time');
        $this->assertStringContainsString('يوجد تعارض في الجدول الزمني', session('errors')->first('schedules.0.start_time'));
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

        // Update the same group with the same schedule (should not conflict with itself)
        $response = $this->put(route('groups.update', $group), [
            'name' => 'Updated Group',
            'description' => 'Updated description',
            'max_students' => 15,
            'is_active' => true,
            'payment_type' => 'monthly',
            'student_price' => 150,
            'academic_year_id' => $this->academicYear->id,
            'schedules' => [
                [
                    'day_of_week' => 1, // Monday
                    'start_time' => '10:00', // Same schedule
                    'end_time' => '12:00',
                ]
            ]
        ]);

        $response->assertRedirect(route('groups.index'));
        $response->assertSessionHas('success');
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

        // Create group for current user with same schedule (should not conflict)
        $response = $this->post(route('groups.store'), [
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
        ]);

        $response->assertRedirect(route('groups.index'));
        $response->assertSessionHas('success');
    }
}
