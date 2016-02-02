<?php

namespace Capco\AppBundle\Generator;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Routing\Router;
use Caxy\HtmlDiffBundle\Service\HtmlDiffService;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionModal;
use Capco\AppBundle\Model\HasDiffInterface;

class DiffGenerator
{
    protected $diffService;

    public function __construct(HtmlDiffService $diffService)
    {
        $this->diffService = $diffService;
    }

    public function generate(HasDiffInterface $entity)
    {
        if ($entity instanceof OpinionVersion) {
            $oldText = $entity->getParent()->getBody();
            $newText = $entity->getBody();
            $diff = $this->diffService->diff($oldText, $newText);
            $entity->setDiff($diff);
            return true;
        }

        if ($entity instanceof OpinionModal) {
            $oldText = $entity->getBefore();
            $newText = $entity->getAfter();
            $diff = $this->diffService->diff($oldText, $newText);
            $entity->setDiff($diff);
            return true;
        }

        return false;
    }
}
