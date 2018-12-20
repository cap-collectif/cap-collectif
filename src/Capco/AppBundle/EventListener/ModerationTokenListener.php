<?php

namespace Capco\AppBundle\EventListener;

use Doctrine\ORM\Event\PreFlushEventArgs;
use FOS\UserBundle\Util\TokenGeneratorInterface;

class ModerationTokenListener
{
    const REFERENCE_TRAIT = 'Capco\AppBundle\Traits\ModerableTrait';
    private $tokenGenerator;

    public function __construct(TokenGeneratorInterface $tokenGenerator)
    {
        $this->tokenGenerator = $tokenGenerator;
    }

    public function preFlush(PreFlushEventArgs $args)
    {
        $om = $args->getEntityManager();
        $uow = $args->getEntityManager()->getUnitOfWork();

        foreach ($uow->getScheduledEntityInsertions() as $entityInsertion) {
            $classMetaData = $om->getClassMetadata(\get_class($entityInsertion));

            // if entity has Moderabble Trait & has not already a moderation_token (specific case in fixtures)
            if (
                $this->hasTrait($classMetaData->getReflectionClass()) &&
                !$entityInsertion->getModerationToken()
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
