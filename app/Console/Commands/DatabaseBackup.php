<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DatabaseBackup extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'backup:database {--force : Force backup even if last backup is recent}';

    /**
     * The console command description.
     */
    protected $description = 'Create a database backup using Laravel\'s built-in methods';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting database backup...');

        try {
            $driver = config('database.default');
            $connection = config("database.connections.{$driver}");
            
            $this->info("📊 Database: {$driver}");
            
            if ($driver === 'sqlite') {
                return $this->backupSQLite($connection);
            } elseif ($driver === 'mysql') {
                return $this->backupMySQL($connection);
            } else {
                $this->error("❌ Unsupported database driver: {$driver}");
                return Command::FAILURE;
            }
            
        } catch (\Exception $e) {
            $this->error("❌ Backup failed: " . $e->getMessage());
            return Command::FAILURE;
        }
    }

    private function backupSQLite($connection)
    {
        $this->info('📂 Creating SQLite backup...');
        
        $sourceFile = $connection['database'];
        
        if (!File::exists($sourceFile)) {
            $this->error("❌ SQLite database file not found: {$sourceFile}");
            return Command::FAILURE;
        }
        
        $backupDir = storage_path('app/database-backups');
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }
        
        $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
        $backupFile = $backupDir . "/teachers_backup_{$timestamp}.sqlite";
        
        File::copy($sourceFile, $backupFile);
        
        $this->info("✅ SQLite backup created: {$backupFile}");
        $this->info("📦 File size: " . $this->formatBytes(File::size($backupFile)));
        
        // Cleanup old backups (keep last 7 days)
        $this->cleanupOldBackups($backupDir, 7);
        
        return Command::SUCCESS;
    }

    private function backupMySQL($connection)
    {
        $this->info('🔧 Creating MySQL backup using Laravel...');
        
        try {
            // Test database connection first
            DB::connection()->getPdo();
            $this->info('✅ Database connection successful');
            
            $backupDir = storage_path('app/database-backups');
            if (!File::exists($backupDir)) {
                File::makeDirectory($backupDir, 0755, true);
            }
            
            $timestamp = Carbon::now()->format('Y-m-d_H-i-s');
            $backupFile = $backupDir . "/teachers_backup_{$timestamp}.sql";
            
            // Get all table names
            $tables = DB::select('SHOW TABLES');
            $tableKey = 'Tables_in_' . $connection['database'];
            
            $sql = "-- Database backup created on " . Carbon::now() . "\n";
            $sql .= "-- Database: " . $connection['database'] . "\n\n";
            
            foreach ($tables as $table) {
                $tableName = $table->$tableKey;
                
                // Skip telescope tables for smaller backups
                if (str_contains($tableName, 'telescope')) {
                    continue;
                }
                
                $this->info("📊 Backing up table: {$tableName}");
                
                // Get table structure
                $createTable = DB::select("SHOW CREATE TABLE `{$tableName}`")[0];
                $sql .= "-- Table: {$tableName}\n";
                $sql .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
                $sql .= $createTable->{'Create Table'} . ";\n\n";
                
                // Get table data
                $rows = DB::table($tableName)->get();
                
                if ($rows->count() > 0) {
                    $sql .= "-- Data for table: {$tableName}\n";
                    $sql .= "INSERT INTO `{$tableName}` VALUES \n";
                    
                    $values = [];
                    foreach ($rows as $row) {
                        $rowData = array_map(function ($value) {
                            return is_null($value) ? 'NULL' : "'" . addslashes($value) . "'";
                        }, (array) $row);
                        $values[] = '(' . implode(', ', $rowData) . ')';
                    }
                    
                    $sql .= implode(",\n", $values) . ";\n\n";
                }
            }
            
            File::put($backupFile, $sql);
            
            $this->info("✅ MySQL backup created: {$backupFile}");
            $this->info("📦 File size: " . $this->formatBytes(File::size($backupFile)));
            
            // Cleanup old backups
            $this->cleanupOldBackups($backupDir, 7);
            
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error("❌ MySQL backup failed: " . $e->getMessage());
            return Command::FAILURE;
        }
    }

    private function cleanupOldBackups($directory, $daysToKeep)
    {
        $this->info("🧹 Cleaning up old backups (keeping last {$daysToKeep} days)...");
        
        $files = File::glob($directory . '/*');
        $cutoffDate = Carbon::now()->subDays($daysToKeep);
        $deletedCount = 0;
        
        foreach ($files as $file) {
            $fileDate = Carbon::createFromTimestamp(File::lastModified($file));
            
            if ($fileDate->lt($cutoffDate)) {
                File::delete($file);
                $deletedCount++;
            }
        }
        
        if ($deletedCount > 0) {
            $this->info("🗑️  Deleted {$deletedCount} old backup files");
        } else {
            $this->info("✅ No old backups to clean up");
        }
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
