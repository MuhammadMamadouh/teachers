<?php

namespace App\Console\Commands;

use App\Models\Group;
use App\Models\Payment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GenerateMonthlyPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:generate-monthly {--month=} {--year=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate monthly payments for all groups with monthly payment type';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $month = $this->option('month') ?? Carbon::now()->month;
        $year = $this->option('year') ?? Carbon::now()->year;

        $this->info("Generating monthly payments for {$month}/{$year}...");

        $monthlyGroups = Group::where('payment_type', 'monthly')
            ->where('is_active', true)
            ->with('assignedStudents')
            ->get();

        $totalPaymentsCreated = 0;
        $totalGroupsProcessed = 0;

        DB::transaction(function () use ($monthlyGroups, $month, $year, &$totalPaymentsCreated, &$totalGroupsProcessed) {
            foreach ($monthlyGroups as $group) {
                $paymentsCreated = 0;
                $relatedDate = Carbon::createFromDate($year, $month, 1);

                foreach ($group->assignedStudents as $student) {
                    $payment = Payment::firstOrCreate(
                        [
                            'group_id' => $group->id,
                            'student_id' => $student->id,
                            'related_date' => $relatedDate,
                        ],
                        [
                            'payment_type' => 'monthly',
                            'amount' => $group->student_price,
                            'is_paid' => false,
                        ]
                    );

                    if ($payment->wasRecentlyCreated) {
                        $paymentsCreated++;
                    }
                }

                if ($paymentsCreated > 0) {
                    $this->info("Group '{$group->name}': {$paymentsCreated} payments created");
                }

                $totalPaymentsCreated += $paymentsCreated;
                $totalGroupsProcessed++;
            }
        });

        $this->info("Summary:");
        $this->info("- Groups processed: {$totalGroupsProcessed}");
        $this->info("- Total payments created: {$totalPaymentsCreated}");
        $this->info("Monthly payments generation completed successfully!");

        return Command::SUCCESS;
    }
}
