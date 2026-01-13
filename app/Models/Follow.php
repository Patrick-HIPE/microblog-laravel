<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

class Follow extends Pivot
{
    use SoftDeletes;

    protected $table = 'follows';

    protected $dates = ['deleted_at']; 
}