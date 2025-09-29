<?php

namespace Capco\AppBundle\EventListener;

use Doctrine\ORM\Event\PreFlushEventArgs;
use FOS\UserBundle\Util\TokenGeneratorInterface;

class ModerationTokenListener
{
    final public const REFERENCE_TRAIT = 'Capco\AppBundle\Traits\ModerableTrait';

    public function __construct(
        private readonly TokenGeneratorInterface $tokenGenerator
    ) {
    }

    public function preFlush(PreFlushEventArgs $args)
    {
        $om = $args->getEntityManager();
        $uow = $args->getEntityManager()->getUnitOfWork();

        foreach ($uow->getScheduledEntityInsertions() as $entityInsertion) {
            $classMetaData = $om->getClassMetadata($entityInsertion::class);

            // if entity has Moderabble Trait & has not already a moderation_token (specific case in fixtures)
            if (
                $this->hasTrait($classMetaData->getReflectionClass())
                && !$entityInsertion->getModerationToken()
            ) {
                $token = $this->tokenGenerator->generateToken();
                $entityInsertion->setModerationToken($token);
            }
        }
    }

    private function hasTrait(\ReflectionClass $reflectionClass): bool
    {
        if (\in_array(self::REFERENCE_TRAIT, $reflectionClass->getTraitNames(), true)) {
            return true;
        }

        return false;
    }
}
