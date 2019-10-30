<?php

namespace Capco\AppBundle\Enum;

trait ReportingStatus
{
    public static $statusesLabels = [
        ReportingType::SEX => 'reporting.status.sexual',
        ReportingType::OFF => 'reporting.status.offending',
        ReportingType::SPAM => 'reporting.status.spam',
        ReportingType::ERROR => 'reporting.status.error',
        ReportingType::OFF_TOPIC => 'reporting.status.off_topic'
    ];
}
