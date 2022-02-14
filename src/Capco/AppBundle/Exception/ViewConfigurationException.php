<?php

namespace Capco\AppBundle\Exception;

class ViewConfigurationException extends ConfigurationException
{
    public const NO_VIEW_ACTIVE = 'No view is active. At least one must be selected';
    public const MAP_WITHOUT_ADDRESS = 'Map view cannot be used without location';
    public const INVALID_MAIN_VIEW = 'The main view is not valid. It must be GRID, LIST or MAP.';
    public const MAIN_VIEW_NOT_ACTIVE = 'The main view is configured on a inactive view';
}
