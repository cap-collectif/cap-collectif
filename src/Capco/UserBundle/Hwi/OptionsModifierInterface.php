<?php

declare(strict_types=1);

namespace Capco\UserBundle\Hwi;

use HWI\Bundle\OAuthBundle\OAuth\ResourceOwnerInterface;

interface OptionsModifierInterface
{
    public function modifyOptions(array $options, ResourceOwnerInterface $resourceOwner): array;
}
