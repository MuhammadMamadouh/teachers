<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    use HasFactory;

    public $table = 'feedbacks';

    protected $fillable = [
        'user_id',
        'type',
        'message',
        'status',
        'reply',
        'responded_at',
        'is_read_by_admin',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
        'is_read_by_admin' => 'boolean',
    ];

    /**
     * Get the user who submitted this feedback
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get feedback type in Arabic
     */
    public function getTypeInArabicAttribute(): string
    {
        return match($this->type) {
            'suggestion' => 'اقتراح',
            'bug' => 'مشكلة تقنية',
            'question' => 'استفسار',
            default => $this->type,
        };
    }

    /**
     * Get status in Arabic
     */
    public function getStatusInArabicAttribute(): string
    {
        return match($this->status) {
            'new' => 'جديد',
            'in_progress' => 'قيد المراجعة',
            'resolved' => 'تم الحل',
            default => $this->status,
        };
    }

    /**
     * Get status color for badges
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'new' => 'bg-blue-100 text-blue-800',
            'in_progress' => 'bg-yellow-100 text-yellow-800',
            'resolved' => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    /**
     * Scope for filtering by type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for search by message or user name
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('message', 'like', "%{$search}%")
              ->orWhereHas('user', function ($userQuery) use ($search) {
                  $userQuery->where('name', 'like', "%{$search}%");
              });
        });
    }
}
