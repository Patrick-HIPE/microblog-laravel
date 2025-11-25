<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request)
    {
        $query = $request->input('query');

        // Return empty array if no query to save database calls
        if (!$query) {
            return response()->json([]);
        }

        // Search Users
        $users = User::query()
            ->where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->limit(5) // Limit to 5 to keep UI clean
            ->get(['id', 'name', 'email']); // Only select what you need!

        // Future-proofing: You can easily add 'posts' => $posts here later
        return response()->json([
            'users' => $users,
        ]);
    }
}
