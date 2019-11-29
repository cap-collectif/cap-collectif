<?php

namespace Capco\AppBundle\Exception;

class LocaleConfigurationException extends ConfigurationException
{
    public const MESSAGE_DEFAULT_NONE = 'There is no default locale';
    public const MESSAGE_DEFAULT_SEVERAL = 'Default locale is not unique';
    public const MESSAGE_DEFAULT_UNPUBLISHED = 'A unpublished locale cannot be set as default locale. Publish it first';
    public const MESSAGE_DISABLE_PUBLISHED = 'A published locale cannot be disabled. Unpublish it first';
    public const MESSAGE_PUBLISH_DISABLED = 'A disabled locale cannot be publish. Enable it first';
}
