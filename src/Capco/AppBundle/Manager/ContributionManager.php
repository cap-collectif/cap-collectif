<?php

namespace Capco\AppBundle\Manager;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManager;

class ContributionManager
{
    public function __construct(EntityManager $em)
    {
        $this->em = $em;
    }

    public function republishContributions(User $user)
    {
        $republishedCount = 0;
        foreach ($user->getContributions() as $contribution) {
            $contribution->setExpired(false);
            $republishedCount++;
        }
        return $republishedCount > 0;
    }

    public function depublishContributions(User $user)
    {
        $expiredCount = 0;
        foreach ($user->getContributions() as $contribution) {
            $contribution->setExpired(true);
            $expiredCount++;
        }
        return $expiredCount > 0;
    }

    public function createOpinionForType(OpinionType $type) : Opinion
    {
      $opinion = new Opinion();
      $opinion->setOpinionType($type);
      $opinionTypeAppendixTypes = $this->em->getRepository('CapcoAppBundle:OpinionTypeAppendixType')->findBy(['opinionType' => $type]);
      foreach ($opinionTypeAppendixTypes as $appendexType) {
        $app = new OpinionAppendix();
        $app->setAppendixType($otat->getAppendixType());
        $opinion->addAppendice($app);
      }

      foreach ($appendices as $appendix) {
        if ($appendix->getAppendixType() == $otat->getAppendixType()) {
            $found = true;
        }
      }
      if (!$found) {
        $app = new OpinionAppendix();
        $app->setAppendixType($otat->getAppendixType());
        $app->setOpinion($opinion);
        $opinion->addAppendice($app);
      }
      }
    }

}
