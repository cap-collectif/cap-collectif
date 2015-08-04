<?php

namespace Capco\AppBundle\Synthesis\Handler;

use Doctrine\ORM\EntityManager;
use Capco\AppBundle\Manager\LogManager;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Entity\Synthesis\SynthesisDivision;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SynthesisElementHandler
{
    protected $em;
    protected $logManager;

    protected static $types = ['all', 'archived', 'new', 'unpublished', 'published', 'tree_all', 'tree_published'];

    public function __construct(EntityManager $em, LogManager $logManager)
    {
        $this->em = $em;
        $this->logManager = $logManager;
    }

    protected function getTypeConditions($type = null)
    {
        if ($type === null || !in_array($type, self::$types)) {
            throw new NotFoundHttpException();
        }

        $conditions = [];
        switch ($type) {
            case 'all':
                break;
            case 'new':
                $conditions['archived'] = false;
                break;
            case 'unpublished':
                $conditions['archived'] = true;
                $conditions['published'] = false;
                break;
            case 'archived':
                $conditions['archived'] = true;
                break;
            case 'published':
                $conditions['archived'] = true;
                $conditions['published'] = true;
                break;
            case 'tree_all':
                $conditions['parent'] = null;
                break;
            case 'tree_published':
                $conditions['parent'] = null;
                $conditions['archived'] = true;
                $conditions['published'] = true;
                break;
            default:
                break;
        }
        return $conditions;
    }

    public function getElementsFromSynthesisByType($synthesis, $type = null)
    {
        $values = array_merge(['synthesis' => $synthesis], $this->getTypeConditions($type));
        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->getWith($values);
    }

    public function countElementsFromSynthesisByType($synthesis, $type = null)
    {
        $values = array_merge(['synthesis' => $synthesis], $this->getTypeConditions($type));
        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->countWith($values);
    }

    public function createElementInSynthesis(SynthesisElement $element, Synthesis $synthesis)
    {
        $element->setSynthesis($synthesis);
        $element->setDisplayType('folder');

        $this->em->persist($element);
        $this->em->flush();

        return $element;
    }

    public function updateElementInSynthesis(SynthesisElement $element, Synthesis $synthesis)
    {
        // If we're adding a division to the element, we need to do some stuff
        if ($element->getDivision()) {
            $division = $this->updateDivisionFromElementInSynthesis($element->getDivision(), $element, $synthesis);
        }

        $this->em->persist($element);
        $this->em->flush();

        return $element;
    }

    public function updateDivisionFromElementInSynthesis(SynthesisDivision $division, SynthesisElement $element, Synthesis $synthesis)
    {
        foreach ($division->getElements() as $el) {
            $el->setSynthesis($synthesis);
            $el->setAuthor($element->getAuthor());
            $el->setLink($element->getLink());

            $el->setLinkedDataClass($element->getLinkedDataClass());
            $el->setLinkedDataId($element->getLinkedDataId());
            $el->setLinkedDataCreation($element->getLinkedDataCreation());
            $el->setLinkedDataLastUpdate($element->getLinkedDataLastUpdate());
            $this->em->persist($el);
        }

        $this->em->persist($division);
        return $division;
    }

    public function getLogsForElement(SynthesisElement $element)
    {
        return $this->logManager->getLogEntries($element);
    }
}
