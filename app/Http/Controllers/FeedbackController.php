<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    /**
     * Display the feedback form and user's feedbacks
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get user's feedbacks with pagination
        $feedbacks = $user->feedbacks()
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Feedback/Index', [
            'feedbacks' => $feedbacks,
            'feedbackTypes' => [
                'suggestion' => 'اقتراح',
                'bug' => 'مشكلة تقنية',
                'question' => 'استفسار',
            ],
        ]);
    }

    /**
     * Store a new feedback
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'type' => 'required|in:suggestion,bug,question',
            'message' => 'required|string|min:10|max:1000',
        ], [
            'type.required' => 'نوع التعليق مطلوب',
            'type.in' => 'نوع التعليق غير صحيح',
            'message.required' => 'رسالة التعليق مطلوبة',
            'message.min' => 'رسالة التعليق يجب أن تكون 10 أحرف على الأقل',
            'message.max' => 'رسالة التعليق يجب ألا تزيد عن 1000 حرف',
        ]);

        $feedback = Feedback::create([
            'user_id' => $request->user()->id,
            'type' => $request->type,
            'message' => $request->message,
            'status' => 'new',
        ]);

        // TODO: Send notification to admin (Step 4)
        // $this->notifyAdmin($feedback);

        return redirect()->back()->with('success', 'تم إرسال التعليق بنجاح! سيتم مراجعته قريباً.');
    }

    /**
     * Show a specific feedback
     */
    public function show(Request $request, Feedback $feedback): Response
    {
        // Ensure user can only view their own feedback
        if ($feedback->user_id !== $request->user()->id) {
            abort(403, 'غير مصرح لك بعرض هذا التعليق');
        }

        return Inertia::render('Feedback/Show', [
            'feedback' => $feedback->load('user'),
        ]);
    }
}
