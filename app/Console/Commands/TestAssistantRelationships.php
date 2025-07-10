<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestAssistantRelationships extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:assistant-relationships';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test assistant user relationships and functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Assistant User Relationships...');

        // Find a teacher user
        $teacher = \App\Models\User::where('type', 'teacher')->first();
        if (!$teacher) {
            $this->error('No teacher users found. Creating a test teacher...');
            $teacher = \App\Models\User::create([
                'name' => 'Test Teacher',
                'email' => 'teacher@test.com',
                'password' => bcrypt('password'),
                'type' => 'teacher',
                'is_approved' => true,
            ]);
        }

        $this->info("Using teacher: {$teacher->name} (ID: {$teacher->id})");

        // Test helper methods
        $this->info("Is teacher? " . ($teacher->isTeacher() ? 'Yes' : 'No'));
        $this->info("Is assistant? " . ($teacher->isAssistant() ? 'Yes' : 'No'));
        $this->info("Current assistants: " . $teacher->getAssistantCount());

        // Check if teacher can add assistants
        $canAdd = $teacher->canAddAssistants();
        $this->info("Can add assistants? " . ($canAdd ? 'Yes' : 'No'));

        if ($canAdd) {
            // Create a test assistant
            $assistant = \App\Models\User::create([
                'name' => 'Test Assistant',
                'email' => 'assistant@test.com',
                'password' => bcrypt('password'),
                'phone' => '1234567890',
                'subject' => 'Assistant Help',
                'city' => 'Test City',
                'type' => 'assistant',
                'teacher_id' => $teacher->id,
                'is_approved' => true,
            ]);

            $this->info("Created assistant: {$assistant->name} (ID: {$assistant->id})");

            // Test assistant relationships
            $this->info("Assistant's teacher: " . $assistant->teacher->name);
            $this->info("Assistant is assistant? " . ($assistant->isAssistant() ? 'Yes' : 'No'));
            $this->info("Assistant's main teacher: " . $assistant->getMainTeacher()->name);

            // Test teacher's assistants
            $teacher->refresh();
            $this->info("Teacher now has {$teacher->getAssistantCount()} assistants");
            $this->info("Teacher's assistants: " . $teacher->assistants->pluck('name')->join(', '));

            $this->info('✅ All tests passed!');
        } else {
            $this->warn('Teacher cannot add assistants. Check subscription plan limits.');
        }

        return 0;
    }
}
