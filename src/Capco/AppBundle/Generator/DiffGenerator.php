<?php

namespace Capco\AppBundle\Generator;

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
            $oldText = html_entity_decode($entity->getParent()->getBody());
            $newText = html_entity_decode($entity->getBody());
            $diff = $this->diffService->diff($oldText, $newText);
            $entity->setDiff($diff);

            return true;
        }

        if ($entity instanceof OpinionModal) {
            $oldText = html_entity_decode($entity->getBefore());
            $newText = html_entity_decode($entity->getAfter());
            $diff = $this->diffService->diff($oldText, $newText);
            $entity->setDiff($diff);

            return true;
        }

        return false;
    }
}
