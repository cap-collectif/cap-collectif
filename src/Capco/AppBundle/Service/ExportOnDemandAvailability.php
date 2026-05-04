<?php

namespace Capco\AppBundle\Service;

enum ExportOnDemandAvailability
{
    case AVAILABLE;

    case REQUESTED;

    case EMPTY;

    case FAILED;
}
