<?php

namespace Capco\AppBundle\Synthesis\Handler;

use Capco\AppBundle\Entity\Synthesis\SynthesisUserInterface;
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

    protected static $types = ['all', 'archived', 'new', 'unpublished', 'published'];

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
            default:
                break;
        }

        return $conditions;
    }

    public function getElementsFromSynthesisByType($synthesis, $type = null, $offset = 0, $limit = null)
    {
        $values = array_merge(['synthesis' => $synthesis], $this->getTypeConditions($type));

        $paginator = $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->getWith($values, $offset, $limit);

        $elements = [];
        foreach ($paginator as $element) {
            $elements[] = $element;
        }

        return [
            'elements' => $elements,
            'count' => count($paginator),
        ];
    }

    public function getElementsTreeFromSynthesisByType($synthesis, $type = null, $parentId = null, $depth = null)
    {
        $values = array_merge(['synthesis' => $synthesis], $this->getTypeConditions($type));

        $repo = $this->em
            ->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')
        ;

        $tree = $repo->getFormattedTree($values, $parentId, $depth);

        return $tree;
    }

    public function countElementsFromSynthesisByType($synthesis, $type = null)
    {
        $values = array_merge(['synthesis' => $synthesis], $this->getTypeConditions($type));

        return $this->em->getRepository('CapcoAppBundle:Synthesis\SynthesisElement')->countWith($values);
    }

    public function createElementInSynthesis(SynthesisElement $element, Synthesis $synthesis, SynthesisUserInterface $user = null)
    {
        $element->setSynthesis($synthesis);
        $element->setDisplayType('folder');
        $element->setAuthor($user);

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

        // If we're ignoring the element, all childrens must be ignored
        if (!$element->isPublished()) {
            $element = $this->ignoreElementChildren($element);
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

    public function ignoreElementChildren(SynthesisElement $element)
    {
        foreach ($element->getChildren() as $child) {
            $child->setPublished(false);
            $child->setArchived(true);
            $this->ignoreElementChildren($child);
        }

        return $element;
    }

    public function getLogsForElement(SynthesisElement $element)
    {
        return $this->logManager->getLogEntries($element);
    }
}
