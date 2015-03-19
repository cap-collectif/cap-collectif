<?php

namespace Capco\AppBundle\Resolver;


use Capco\AppBundle\Entity\Section;
use Capco\AppBundle\Repository\SectionRepository;
use Capco\AppBundle\Toggle\Manager;

class SectionResolver
{
    protected $repository;
    protected $toggleManager;

    public function __construct(SectionRepository $repository, Manager $toggleManager)
    {
        $this->repository = $repository;
        $this->toggleManager = $toggleManager;
    }

    /**
     * @return array
     */
    public function getDisplayableSectionsOrdered()
    {
        $all = $this->repository->getAllOrderedByPosition();
        $sections = array();
        foreach ($all as $section) {
            if ($this->toggleManager->containsEnabledFeature($section->getAssociatedFeatures())) {
                $sections[] = $section;
            }
        }
        return $sections;
    }

    /**
     * @return array
     */
    public function getDisplayableEnabledSectionsOrdered()
    {
        $all = $this->repository->getEnabledOrderedByPosition();
        $sections = array();
        foreach ($all as $section) {
            if ($this->toggleManager->containsEnabledFeature($section->getAssociatedFeatures())) {
                $sections[] = $section;
            }
        }
        return $sections;
    }

    /**
     * @param $reference
     * @param $relPos
     * @return null
     */
    public function getObjectToSwitch($reference, $relPos)
    {
        $sections = $this->getDisplayableSectionsOrdered();
        foreach ($sections as $index => $section) {
            if ($section === $reference) {
                return $sections[$index + $relPos];
            }
        }
        return null;

    }

    /**
     * @param Section $section
     * @return bool
     */
    public function isFirstSection(Section $section)
    {
        $sections = $this->getDisplayableSectionsOrdered();
        $first = $sections[0];
        return $section === $first;

    }

    /**
     * @param Section $section
     * @return bool
     */
    public function isLastSection(Section $section)
    {
        $sections = $this->getDisplayableSectionsOrdered();
        $last = $sections[count($sections) - 1];
        return $section === $last;

    }

}
