<?php

declare(strict_types=1);

defined('CASTOR_USE_CHDIR') || define('CASTOR_USE_CHDIR', true);

use function Castor\import;

require_once __DIR__ . '/.castor/helpers.php';

import(__DIR__ . '/.castor/infrastructures.php');
import(__DIR__ . '/.castor/database.php');
import(__DIR__ . '/.castor/app.php');
import(__DIR__ . '/.castor/qa.php');
import(__DIR__ . '/.castor/system.php');
import(__DIR__ . '/.castor/ci.php');
import(__DIR__ . '/.castor/ci_app.php');
import(__DIR__ . '/.castor/ci_qa.php');
import(__DIR__ . '/.castor/ci_database.php');
import(__DIR__ . '/.castor/ci_system.php');
