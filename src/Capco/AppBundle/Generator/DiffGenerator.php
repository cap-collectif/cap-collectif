<?php

namespace Capco\AppBundle\Generator;

use Capco\AppBundle\Entity\OpinionModal;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Model\HasDiffInterface;
use Caxy\HtmlDiffBundle\Service\HtmlDiffService;

class DiffGenerator
{
    protected HtmlDiffService $diffService;

    public function __construct(HtmlDiffService $diffService)
    {
        $this->diffService = $diffService;
    }

    public function generate(HasDiffInterface $entity)
    {
        if ($entity instanceof OpinionVersion) {
            $oldText = html_entity_decode((string) $entity->getParent()->getBody());
            $newText = html_entity_decode((string) $entity->getBody());
            $diff = $this->diffService->diff($oldText, $newText);
            $entity->setDiff($diff);

            return true;
        }

        if ($entity instanceof OpinionModal) {
            $oldText = html_entity_decode((string) $entity->getBefore());
            $newText = html_entity_decode((string) $entity->getAfter());
            $diff = $this->diffService->diff($oldText, $newText);
            $entity->setDiff($diff);

            return true;
        }

        return false;
    }
}
