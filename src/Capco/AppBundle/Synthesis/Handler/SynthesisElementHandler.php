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

    protected static $types = ['all', 'archived', 'new', 'unpublished', 'root'];

    public function __construct(EntityManager $em, LogManager $logManager)
    {
        $this->em = $em;
        $this->logManager = $logManager;
    }

    public function getTypeConditions($type = null)
    {
        if ($type !== null && !in_array($type, self::$types)) {
            throw new NotFoundHttpException();
        }

        $conditions = [];
        switch ($type) {
            case 'all':
                break;
            case 'new':
                $conditions['archived'] = false;
                $conditions['enabled'] = true;
                break;
            case 'unpublished':
                $conditions['enabled'] = false;
                break;
            case 'archived':
                $conditions['archived'] = true;
                $conditions['enabled'] = true;
                break;
            case 'root':
                $conditions['parent'] = null;
                $conditions['enabled'] = true;
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

        $this->em->persist($element);
        $this->em->flush();

        return $element;
    }

    public function updateElementInSynthesis(SynthesisElement $element, Synthesis $synthesis)
    {
        $this->em->persist($element);
        $this->em->flush();

        return $element;
    }

    public function createDivisionFromElementInSynthesis(SynthesisDivision $division, SynthesisElement $element, Synthesis $synthesis)
    {
        foreach ($division->getElements() as $el) {
            $el->setLinkedDataClass($element->getLinkedDataClass());
            $el->setLinkedDataId($element->getLinkedDataId());
            $el->setSynthesis($synthesis);
            if ($element->getParent()) {
                $element->getParent()->addChild($this);
            }
            $el->setNotation($element->getNotation());
            $el->setOriginalDivision($division);
            $this->em->persist($el);
        }

        $division->setOriginalElement($element);
        $this->em->persist($division);

        $this->em->remove($element);
        $this->em->flush();

        return $division;
    }

    public function getLogsForElement(SynthesisElement $element)
    {
        return $this->logManager->getLogEntries($element);
    }
}
