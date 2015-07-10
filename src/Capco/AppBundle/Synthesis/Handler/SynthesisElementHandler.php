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

    public function __construct(EntityManager $em, LogManager $logManager)
    {
        $this->em = $em;
        $this->logManager = $logManager;
    }

    public function getAllElementsFromSynthesis($id)
    {
        if (!($synthesis = $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id))) {
            throw new NotFoundHttpException(sprintf('The resource \'%s\' was not found.', $id));
        }

        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->getWith(array(
            'synthesis' => $synthesis,
        ));
    }

    public function countAllElementsFromSynthesis($id)
    {
        if (!($synthesis = $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id))) {
            throw new NotFoundHttpException(sprintf('The resource \'%s\' was not found.', $id));
        }

        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->countWith(array(
            'synthesis' => $synthesis,
        ));
    }

    public function getNewElementsFromSynthesis($id)
    {
        if (!($synthesis = $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id))) {
            throw new NotFoundHttpException(sprintf('The resource \'%s\' was not found.', $id));
        }

        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->getWith(array(
            'synthesis' => $synthesis,
            'archived' => false,
            'enabled' => true,
        ));
    }

    public function countNewElementsFromSynthesis($id)
    {
        if (!($synthesis = $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id))) {
            throw new NotFoundHttpException(sprintf('The resource \'%s\' was not found.', $id));
        }

        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->countWith(array(
            'synthesis' => $synthesis,
            'archived' => false,
            'enabled' => true,
        ));
    }

    public function getUnpublishedElementsFromSynthesis($id)
    {
        if (!($synthesis = $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id))) {
            throw new NotFoundHttpException(sprintf('The resource \'%s\' was not found.', $id));
        }

        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->getWith(array(
            'synthesis' => $synthesis,
            'enabled' => false,
        ));
    }

    public function countUnpublishedElementsFromSynthesis($id)
    {
        if (!($synthesis = $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id))) {
            throw new NotFoundHttpException(sprintf('The resource \'%s\' was not found.', $id));
        }

        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->countWith(array(
            'synthesis' => $synthesis,
            'enabled' => false,
        ));
    }

    public function getArchivedElementsFromSynthesis($id)
    {
        if (!($synthesis = $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id))) {
            throw new NotFoundHttpException(sprintf('The resource \'%s\' was not found.', $id));
        }

        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->getWith(array(
            'synthesis' => $synthesis,
            'archived' => true,
            'enabled' => true,
        ));
    }

    public function countArchivedElementsFromSynthesis($id)
    {
        if (!($synthesis = $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id))) {
            throw new NotFoundHttpException(sprintf('The resource \'%s\' was not found.', $id));
        }

        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->countWith(array(
            'synthesis' => $synthesis,
            'archived' => true,
            'enabled' => true,
        ));
    }

    public function getRootElementsFromSynthesis($id)
    {
        if (!($synthesis = $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id))) {
            throw new NotFoundHttpException(sprintf('The resource \'%s\' was not found.', $id));
        }

        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->getWith(array(
            'synthesis' => $synthesis,
            'parent' => null,
        ));
    }

    public function countRootElementsFromSynthesis($id)
    {
        if (!($synthesis = $this->em->getRepository('CapcoAppBundle:Synthesis\Synthesis')->find($id))) {
            throw new NotFoundHttpException(sprintf('The resource \'%s\' was not found.', $id));
        }

        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->countWith(array(
            'synthesis' => $synthesis,
            'parent' => null,
        ));
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
