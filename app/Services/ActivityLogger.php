<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;

class ActivityLogger
{
    /**
     * Log an activity performed by a user.
     *
     * @param User   $user        The user performing the action
     * @param string $action      Action type: shift_open, shift_close, order_create, order_void, petty_cash
     * @param string $description Human-readable description of the action
     * @param array  $metadata    Optional additional data (order_id, shift_id, amount, etc.)
     */
    public static function log(User $user, string $action, string $description, array $metadata = []): ActivityLog
    {
        return ActivityLog::create([
            'user_id'     => $user->id,
            'action'      => $action,
            'description' => $description,
            'metadata'    => !empty($metadata) ? $metadata : null,
        ]);
    }
}
