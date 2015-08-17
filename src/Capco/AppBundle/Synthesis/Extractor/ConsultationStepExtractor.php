<?php

namespace Capco\AppBundle\Synthesis\Extractor;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Source;
use Doctrine\ORM\EntityManager;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Argument;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Routing\Router;

class ConsultationStepExtractor
{
    protected $em;
    protected $translator;
    protected $router;

    public function __construct(EntityManager $em, TranslatorInterface $translator, Router $router)
    {
        $this->em = $em;
        $this->translator = $translator;
        $this->router = $router;
    }

    public function createOrUpdateElementsFromConsultationStep(Synthesis $synthesis, ConsultationStep $consultationStep)
    {
        if ($consultationStep === null) {
            return false;
        }

        $previousElements = $synthesis->getElements();

        // Opinion types
        $opinionTypes = $consultationStep->getAllowedTypes();
        foreach ($opinionTypes as $ot) {
            $elementFromOT = null;
            foreach ($previousElements as $element) {
                if ($this->isElementRelated($element, $ot)) {
                    $elementFromOT = $element;
                    if ($this->elementIsOutdated($elementFromOT, $ot)) {
                        $elementFromOT = $this->updateElementFromObject($elementFromOT, $ot);
                    }
                }
            }

            if (null === $elementFromOT) {
                $elementFromOT = $this->createElementFromOpinionType($ot);
                $synthesis->addElement($elementFromOT);
            }

            // Opinions
            $opinions = $this->em->getRepository('CapcoAppBundle:Opinion')->findBy([
                'step' => $consultationStep,
                'OpinionType' => $ot,
            ]);
            foreach ($opinions as $opinion) {
                $elementFromOpinion = null;
                foreach ($previousElements as $element) {
                    if ($this->isElementRelated($element, $opinion)) {
                        $elementFromOpinion = $element;
                        if ($this->elementIsOutdated($elementFromOpinion, $opinion)) {
                            $elementFromOpinion = $this->updateElementFromObject($elementFromOpinion, $opinion);
                        }
                    }
                }

                if (null === $elementFromOpinion) {
                    $elementFromOpinion = $this->createElementFromOpinion($opinion);
                    $elementFromOT->addChild($elementFromOpinion);
                    $synthesis->addElement($elementFromOpinion);
                }

                // Arguments folders
                $proArgumentsElement = $this->getArgumentsFolder($elementFromOpinion, 1, $synthesis);
                $consArgumentsElement = $this->getArgumentsFolder($elementFromOpinion, 0, $synthesis);

                // Arguments
                $arguments = $opinion->getArguments();
                foreach ($arguments as $argument) {
                    $elementFromArgument = null;
                    foreach ($previousElements as $element) {
                        if ($this->isElementRelated($element, $argument)) {
                            $elementFromArgument = $element;
                            if ($this->elementIsOutdated($elementFromArgument, $argument)) {
                                $elementFromArgument = $this->updateElementFromObject($elementFromArgument, $argument);
                            }
                        }
                    }
                    if (null === $elementFromArgument) {
                        $elementFromArgument = $this->createElementFromArgument($argument);
                        if ($argument->getType() == 1) {
                            $proArgumentsElement->addChild($elementFromArgument);
                        } else {
                            $consArgumentsElement->addChild($elementFromArgument);
                        }
                        $synthesis->addElement($elementFromArgument);
                    }
                }

                // Sources folder
                $sourcesElement = $this->getSourcesFolder($elementFromOpinion, $synthesis);

                // Sources
                $sources = $opinion->getSources();
                foreach ($sources as $source) {
                    $elementFromSource = null;
                    foreach ($previousElements as $element) {
                        if ($this->isElementRelated($element, $source)) {
                            $elementFromSource = $element;
                            if ($this->elementIsOutdated($elementFromSource, $source)) {
                                $elementFromSource = $this->updateElementFromObject($elementFromSource, $source);
                            }
                        }
                    }
                    if (null === $elementFromSource) {
                        $elementFromSource = $this->createElementFromSource($source);
                        $sourcesElement->addChild($elementFromSource);
                        $synthesis->addElement($elementFromSource);
                    }
                }
            }
        }

        $this->em->flush();

        return $synthesis;
    }

    public function isElementRelated(SynthesisElement $element, $object)
    {
        return $element->getLinkedDataClass() === get_class($object) && $element->getLinkedDataId() == $object->getId();
    }

    public function elementIsOutdated(SynthesisElement $element, $object)
    {
        return $object->getUpdatedAt() > $element->getLinkedDataLastUpdate();
    }

    public function getSourcesFolder(SynthesisElement $opinionElement, Synthesis $synthesis)
    {
        $label = $this->getSourcesFolderLabel();
        foreach ($opinionElement->getChildren() as $el) {
            if ($el->getDisplayType() === 'folder' && $el->getTitle() === $label) {
                return $el;
            }
        }
        $folder = new SynthesisElement();
        $folder->setTitle($label);
        $folder->setDisplayType('folder');
        $folder->setArchived(true);
        $folder->setPublished(true);
        $opinionElement->addChild($folder);
        $synthesis->addElement($folder);
        return $folder;
    }

    public function getSourcesFolderLabel()
    {
        return $this->translator->trans('synthesis.consultation_step.sources', [], 'CapcoAppBundleSynthesis');

    }

    public function getArgumentsFolder(SynthesisElement $opinionElement, $value, Synthesis $synthesis)
    {
        $label = $this->getArgumentsFolderLabel($value);
        foreach ($opinionElement->getChildren() as $el) {
            if ($el->getDisplayType() === 'folder' && $el->getTitle() === $label) {
                return $el;
            }
        }
        $folder = new SynthesisElement();
        $folder->setTitle($label);
        $folder->setDisplayType('folder');
        $folder->setArchived(true);
        $folder->setPublished(true);
        $opinionElement->addChild($folder);
        $synthesis->addElement($folder);
        return $folder;
    }

    public function getArgumentsFolderLabel($value)
    {
        $label = '';
        if ($value === 1) {
            $label = 'synthesis.consultation_step.arguments.pros';
        } else if ($value === 0) {
            $label = 'synthesis.consultation_step.arguments.cons';
        }
        return $this->translator->trans($label, [], 'CapcoAppBundleSynthesis');

    }

    public function createElementFromOpinionType(OpinionType $opinionType)
    {
        $folder = new SynthesisElement();
        $folder->setLinkedDataClass(get_class($opinionType));
        $folder->setLinkedDataId($opinionType->getId());
        $folder->setLinkedDataCreation($opinionType->getCreatedAt());
        $folder->setDisplayType('folder');
        $folder->setArchived(true);
        $folder->setPublished(true);

        return $this->updateElementFromOpinionType($folder, $opinionType);
    }

    public function createElementFromOpinion(Opinion $opinion)
    {
        $element = new SynthesisElement();
        $element->setLinkedDataClass(get_class($opinion));
        $element->setLinkedDataId($opinion->getId());
        $element->setLinkedDataCreation($opinion->getCreatedAt());
        $element->setDisplayType('contribution');

        return $this->updateElementFromOpinion($element, $opinion);
    }

    public function createElementFromArgument(Argument $argument)
    {
        $element = new SynthesisElement();
        $element->setLinkedDataClass(get_class($argument));
        $element->setLinkedDataId($argument->getId());
        $element->setLinkedDataCreation($argument->getCreatedAt());
        $element->setDisplayType('contribution');

        return $this->updateElementFromArgument($element, $argument);
    }

    public function createElementFromSource(Source $source)
    {
        $element = new SynthesisElement();
        $element->setLinkedDataClass(get_class($source));
        $element->setLinkedDataId($source->getId());
        $element->setLinkedDataCreation($source->getCreatedAt());
        $element->setDisplayType('source');

        return $this->updateElementFromSource($element, $source);
    }

    public function updateElementFromObject(SynthesisElement $element, $object)
    {
        // Update last modified, archive status and deletion date
        $element->setLinkedDataLastUpdate($object->getUpdatedAt());
        $element->setArchived(false);
        $element->setPublished(false);
        if (!$element->getOriginalDivision()) {
            $element->setDeletedAt(null);
        }

        if ($object instanceof OpinionType) {
            return $this->updateElementFromOpinionType($element, $object);
        }
        if ($object instanceof Opinion) {
            return $this->updateElementFromOpinion($element, $object);
        }
        if ($object instanceof Source) {
            return $this->updateElementFromSource($element, $object);
        }
        if ($object instanceof Argument) {
            return $this->updateElementFromArgument($element, $object);
        }
    }

    public function updateElementFromOpinionType(SynthesisElement $element, OpinionType $opinionType)
    {
        // Set author
        $element->setAuthor(null);

        $element->setTitle($opinionType->getTitle());
        $element->setBody(null);

        // Set votes
        $element->setVotes([]);

        return $element;
    }

    public function updateElementFromOpinion(SynthesisElement $element, Opinion $opinion)
    {
        // Set author
        $element->setAuthor($opinion->getAuthor());

        if (!$element->getOriginalDivision()) {
            $element->setTitle($opinion->getTitle());
            $element->setBody($opinion->getBody());

            // Set votes
            $votes = array();
            $votes['-1'] = $opinion->getVoteCountNok();
            $votes['0'] = $opinion->getVoteCountMitige();
            $votes['1'] = $opinion->getVoteCountOk();
            $element->setVotes($votes);
        }

        return $element;
    }

    public function updateElementFromSource(SynthesisElement $element, Source $source)
    {
        // Set author
        $element->setAuthor($source->getAuthor());

        $element->setTitle($source->getTitle());
        $element->setBody($source->getBody());

        // Set link
        if ($source->getMedia()) {
            $mediaURL = $this->router->generate('sonata_media_download', ['id' => $source->getMedia()->getId()]);
            $element->setLink($mediaURL);
        } else if ($source->getLink()) {
            $element->setLink($source->getLink());
        }

        // Set votes
        $votes = array();
        $votes['1'] = $source->getVoteCount();
        $element->setVotes($votes);

        return $element;
    }

    public function updateElementFromArgument(SynthesisElement $element, Argument $argument)
    {
        // Set author
        $element->setAuthor($argument->getAuthor());

        $element->setBody($argument->getBody());

        // Set votes
        $votes = array();
        $votes['1'] = $argument->getVoteCount();
        $element->setVotes($votes);

        return $element;
    }
}
