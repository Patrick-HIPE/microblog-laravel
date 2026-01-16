<?php

namespace App\Http\Controllers;

use App\Services\SearchService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    public function __invoke(Request $request, SearchService $searchService): JsonResponse
    {
        $results = $searchService->search($request->input('query'));

        return response()->json($results);
    }
}
