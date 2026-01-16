<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Http\Resources\PostResource;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request, DashboardService $dashboardService)
    {
        $timeline = $dashboardService->getTimeline($request->user());

        return Inertia::render('dashboard', [
            'posts' => PostResource::collection($timeline),
        ]);
    }
}
