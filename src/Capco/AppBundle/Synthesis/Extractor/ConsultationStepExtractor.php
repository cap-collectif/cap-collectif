<?php

namespace Capco\AppBundle\Synthesis\Extractor;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Resolver\OpinionTypesResolver;
use Capco\AppBundle\Resolver\UrlResolver;
use Doctrine\ORM\EntityManager;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Argument;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Routing\Router;

class ConsultationStepExtractor
{
    const LABEL_ARG_PROS = 'synthesis.consultation_step.arguments.pros';
    const LABEL_ARG_CONS = 'synthesis.consultation_step.arguments.cons';
    const LABEL_ARG_SIMPLE = 'synthesis.consultation_step.arguments.simple';
    const LABEL_SOURCES = 'synthesis.consultation_step.sources';
    const LABEL_VERSIONS = 'synthesis.consultation_step.versions';

    const LABEL_CONTEXT = 'synthesis.consultation_step.context';
    const LABEL_CONTENT = 'synthesis.consultation_step.content';
    const LABEL_COMMENT = 'synthesis.consultation_step.comment';

    protected $em;
    protected $translator;
    protected $router;
    protected $opinionTypesResolver;
    protected $urlResolver;
    protected $synthesis;
    protected $consultationStep;
    protected $previousElements;

    public function __construct(EntityManager $em, TranslatorInterface $translator, Router $router, OpinionTypesResolver $opinionTypeResolver, UrlResolver $urlResolver)
    {
        $this->em = $em;
        $this->translator = $translator;
        $this->router = $router;
        $this->opinionTypesResolver = $opinionTypeResolver;
        $this->urlResolver = $urlResolver;
    }

    // *********************************** Main method **********************************

    /**
     * Update or create all elements from consultation step and return updated synthesis.
     *
     * @param Synthesis        $synthesis
     * @param ConsultationStep $consultationStep
     *
     * @return bool|Synthesis
     */
    public function createOrUpdateElementsFromConsultationStep(Synthesis $synthesis, ConsultationStep $consultationStep)
    {
        if ($consultationStep === null) {
            return false;
        }

        $this->synthesis = $synthesis;
        $this->consultationStep = $consultationStep;
        $this->previousElements = $synthesis->getElements();

        // First we get the opinion types allowed by the consultation step
        $opinionTypes = $consultationStep->getConsultationStepType()->getRootOpinionTypes();
        // Then we start creating or updating the elements from these opinion types
        $this->createElementsFromOpinionTypes($opinionTypes);

        $this->em->flush();

        return $this->synthesis;
    }

    // ************************* Creating groups of elements *****************************

    /**
     * Create or update elements from opinion types and all children elements.
     *
     * @param $opinionTypes
     * @param SynthesisElement|null $parent
     */
    public function createElementsFromOpinionTypes($opinionTypes, SynthesisElement $parent = null)
    {
        foreach ($opinionTypes as $ot) {
            // Create or update element from opinion type
            $elementFromOT = $this->getRelatedElement($ot, $parent);

            // Create elements from opinions
            $opinions = $this->em->getRepository('CapcoAppBundle:Opinion')->findBy([
                'step' => $this->consultationStep,
                'OpinionType' => $ot,
            ]);
            if (count($opinions) > 0) {
                $this->createElementsFromOpinions($opinions, $elementFromOT);
            }

            //Create elements from opinion type children
            $this->createElementsFromOpinionTypes($ot->getChildren(), $elementFromOT);
        }
    }

    /**
     * Create or update elements from opinions and all children elements.
     *
     * @param $opinions
     * @param SynthesisElement|null $parent
     */
    public function createElementsFromOpinions($opinions, SynthesisElement $parent = null)
    {
        foreach ($opinions as $opinion) {

            // Create or update element from opinion
            $elementFromOpinion = $this->getRelatedElement($opinion, $parent);

            // Create elements from arguments
            if ($opinion->getOpinionType()->getCommentSystem() === 2) {
                $proArgumentsElement = $this->createFolderInElement(self::LABEL_ARG_PROS, $elementFromOpinion);
                $consArgumentsElement = $this->createFolderInElement(self::LABEL_ARG_CONS, $elementFromOpinion);
                $this->createElementsFromArguments($opinion->getArguments(), $proArgumentsElement, $consArgumentsElement);
            } elseif ($opinion->getOpinionType()->getCommentSystem() === 1) {
                $simpleArgumentsElement = $this->createFolderInElement(self::LABEL_ARG_SIMPLE, $elementFromOpinion);
                $this->createElementsFromArguments($opinion->getArguments(), $simpleArgumentsElement);
            }

            // Create elements from sources
            if ($opinion->getOpinionType()->isSourceable()) {
                $sourcesElement = $this->createFolderInElement(self::LABEL_SOURCES, $elementFromOpinion);
                $this->createElementsFromSources($opinion->getSources(), $sourcesElement);
            }

            // // Create elements from versions
            if ($opinion->getOpinionType()->isVersionable()) {
                $versionsElement = $this->createFolderInElement(self::LABEL_VERSIONS, $elementFromOpinion);
                $this->createElementsFromVersions($opinion->getVersions(), $versionsElement);
            }
        }
    }

    /**
     * Create or update elements from versions and all children elements.
     *
     * @param $versions
     * @param SynthesisElement|null $parent
     */
    public function createElementsFromVersions($versions, SynthesisElement $parent = null)
    {
        foreach ($versions as $version) {

            // Create or update element from version
            $elementFromVersion = $this->getRelatedElement($version, $parent);

            // Create elements from arguments
            $proArgumentsElement = $this->createFolderInElement(self::LABEL_ARG_PROS, $elementFromVersion);
            $consArgumentsElement = $this->createFolderInElement(self::LABEL_ARG_CONS, $elementFromVersion);
            $this->createElementsFromArguments($version->getArguments(), $proArgumentsElement, $consArgumentsElement);

            // Create elements from sources
            $sourcesElement = $this->createFolderInElement(self::LABEL_SOURCES, $elementFromVersion);
            $this->createElementsFromSources($version->getSources(), $sourcesElement);
        }
    }

    /**
     * Create or update elements from arguments and all children elements.
     *
     * @param $arguments
     * @param SynthesisElement $prosFolder
     * @param SynthesisElement $consFolder
     */
    public function createElementsFromArguments($arguments, SynthesisElement $prosFolder, SynthesisElement $consFolder = null)
    {
        foreach ($arguments as $argument) {
            if ($argument->getType() === 1 || $consFolder !== null) {
                // Define parent folder
                if ($argument->getType() === 1) {
                    $parent = $prosFolder;
                } else {
                    $parent = $consFolder;
                }

                // Create or update element from argument
                $elementFromArgument = $this->getRelatedElement($argument, $parent);
            }
        }
    }

    /**
     * Create or update elements from sources and all children elements.
     *
     * @param $sources
     * @param SynthesisElement $parent
     */
    public function createElementsFromSources($sources, SynthesisElement $parent)
    {
        foreach ($sources as $source) {

            // Create or update element from source
            $elementFromSource = $this->getRelatedElement($source, $parent);
        }
    }

    // ************************ Generate single elements from data *************************

    /**
     * Returns updated or created element from a given contribution.
     *
     * @param $contribution
     * @param SynthesisElement $parent
     *
     * @return SynthesisElement|null
     */
    public function getRelatedElement($contribution, SynthesisElement $parent = null)
    {
        $element = null;
        foreach ($this->previousElements as $el) {
            if ($this->isElementRelated($el, $contribution)) {
                $element = $el;
                if ($this->elementIsOutdated($element, $contribution)) {
                    $element = $this->updateElementFrom($element, $contribution);
                }
            }
        }

        if (null === $element) {
            $element = $this->createElementFrom($contribution);
            $element->setParent($parent);
            $this->synthesis->addElement($element);
        }

        return $element;
    }

    /**
     * Get or create a new folder from a provided parent.
     *
     * @param $label
     * @param SynthesisElement $parent
     *
     * @return SynthesisElement
     */
    public function createFolderInElement($label, SynthesisElement $parent)
    {
        $label = $this->translator->trans($label, [], 'CapcoAppBundleSynthesis');

        // Check if folder already exists
        foreach ($parent->getChildren() as $el) {
            if ($el->getDisplayType() === 'folder' && $el->getTitle() === $label) {
                return $el;
            }
        }

        // Otherwise create folder
        $folder = new SynthesisElement();
        $folder->setTitle($label);
        $folder->setDisplayType('folder');
        $folder->setArchived(true);
        $folder->setPublished(true);
        $folder->setParent($parent);
        $this->synthesis->addElement($folder);

        return $folder;
    }

    /**
     * Create a new element from a contribution.
     *
     * @param $contribution
     *
     * @return SynthesisElement
     */
    public function createElementFrom($contribution)
    {
        $element = new SynthesisElement();
        $element->setLinkedDataClass(get_class($contribution));
        $element->setLinkedDataId($contribution->getId());
        $element->setLinkedDataCreation($contribution->getCreatedAt());
        $element->setLinkedDataLastUpdate($contribution->getUpdatedAt());
        $element->setLinkedDataUrl($this->urlResolver->getObjectUrl($contribution, true));

        if ($contribution instanceof OpinionType) {
            $element->setDisplayType('folder');
            $element->setArchived(true);
            $element->setPublished(true);
        } else {
            $element->setDisplayType('contribution');
            $element->setArchived(false);
            $element->setPublished(false);
        }

        return $this->setDataFrom($element, $contribution);
    }

    /**
     * Update an element from a contribution.
     *
     * @param SynthesisElement $element
     * @param $contribution
     *
     * @return SynthesisElement
     */
    public function updateElementFrom(SynthesisElement $element, $contribution)
    {
        // Update last modified, archive status and deletion date
        $element->setLinkedDataLastUpdate($contribution->getUpdatedAt());
        $element->setArchived(false);
        $element->setPublished(false);
        if (!$element->getOriginalDivision()) {
            $element->setDeletedAt(null);
        }

        return $this->setDataFrom($element, $contribution);
    }

    /**
     * Set data of element from contribution, depending on type.
     *
     * @param SynthesisElement $element
     * @param $contribtution
     *
     * @return SynthesisElement
     */
    public function setDataFrom(SynthesisElement $element, $contribution)
    {
        if ($contribution instanceof OpinionType) {
            return $this->setDataFromOpinionType($element, $contribution);
        }
        if ($contribution instanceof Opinion) {
            return $this->setDataFromOpinion($element, $contribution);
        }
        if ($contribution instanceof OpinionVersion) {
            return $this->setDataFromVersion($element, $contribution);
        }
        if ($contribution instanceof Source) {
            return $this->setDataFromSource($element, $contribution);
        }
        if ($contribution instanceof Argument) {
            return $this->setDataFromArgument($element, $contribution);
        }
    }

    // ************************* Set element data from contributions ***************************

    /**
     * Set element data from an opinion type.
     *
     * @param SynthesisElement $element
     * @param OpinionType      $opinionType
     *
     * @return SynthesisElement
     */
    public function setDataFromOpinionType(SynthesisElement $element, OpinionType $opinionType)
    {
        // Set author
        $element->setAuthor(null);

        $element->setTitle($opinionType->getTitle());
        $element->setSubtitle($opinionType->getSubtitle());
        $element->setBody(null);

        // Set votes
        $element->setVotes([]);

        return $element;
    }

    /**
     * Set element data from an opinion.
     *
     * @param SynthesisElement $element
     * @param Opinion          $opinion
     *
     * @return SynthesisElement
     */
    public function setDataFromOpinion(SynthesisElement $element, Opinion $opinion)
    {
        // Set author
        $element->setAuthor($opinion->getAuthor());

        if (!$element->getOriginalDivision()) {
            $element->setTitle($opinion->getTitle());

            $content = '';
            if (count($opinion->getAppendices()) > 0) {
                $content .= '<p>'.$this->translator->trans(self::LABEL_CONTEXT, [], 'CapcoAppBundleSynthesis').'</p>';
                foreach ($opinion->getAppendices() as $app) {
                    $content .= '<p>'.$app->getAppendixType()->getTitle().'</p>';
                    $content .= $app->getBody();
                }
                $content .= '<p>'.$this->translator->trans(self::LABEL_CONTENT, [], 'CapcoAppBundleSynthesis').'</p>';
            }
            $content .= $opinion->getBody();

            $element->setBody($content);

            // Set votes
            $votes = [];
            $votes['-1'] = $opinion->getVotesCountNok();
            $votes['0'] = $opinion->getVotesCountMitige();
            $votes['1'] = $opinion->getVotesCountOk();
            $element->setVotes($votes);
        }

        return $element;
    }

    /**
     * Set element data from a version.
     *
     * @param SynthesisElement $element
     * @param OpinionVersion   $version
     *
     * @return SynthesisElement
     */
    public function setDataFromVersion(SynthesisElement $element, OpinionVersion $version)
    {
        // Set author
        $element->setAuthor($version->getAuthor());

        if (!$element->getOriginalDivision()) {
            $element->setTitle($version->getTitle());

            $content = '';
            if ($version->getComment()) {
                $content .= '<p>'.$this->translator->trans(self::LABEL_COMMENT, [], 'CapcoAppBundleSynthesis').'</p>';
                $content .= $version->getComment();
                $content .= '<p>'.$this->translator->trans(self::LABEL_CONTENT, [], 'CapcoAppBundleSynthesis').'</p>';
            }
            $content .= $version->getBody();
            $element->setBody($content);

            // Set votes
            $votes = [];
            $votes['-1'] = $version->getVotesCountNok();
            $votes['0'] = $version->getVotesCountMitige();
            $votes['1'] = $version->getVotesCountOk();
            $element->setVotes($votes);
        }

        return $element;
    }

    /**
     * Set element data from a source.
     *
     * @param SynthesisElement $element
     * @param Source           $source
     *
     * @return SynthesisElement
     */
    public function setDataFromSource(SynthesisElement $element, Source $source)
    {
        // Set author
        $element->setAuthor($source->getAuthor());

        $element->setTitle($source->getTitle());
        $element->setBody($source->getBody());

        // Set link
        if ($source->getMedia()) {
            $mediaURL = $this->router->generate('sonata_media_download', ['id' => $source->getMedia()->getId()]);
            $element->setLink($mediaURL);
        } elseif ($source->getLink()) {
            $element->setLink($source->getLink());
        }

        // Set votes
        $votes = [];
        $votes['1'] = $source->getVotesCount();
        $element->setVotes($votes);

        return $element;
    }

    /**
     * Set element data from an argument.
     *
     * @param SynthesisElement $element
     * @param Argument         $argument
     *
     * @return SynthesisElement
     */
    public function setDataFromArgument(SynthesisElement $element, Argument $argument)
    {
        // Set author
        $element->setAuthor($argument->getAuthor());

        $element->setBody($argument->getBody());

        // Set votes
        $votes = [];
        $votes['1'] = $argument->getVotesCount();
        $element->setVotes($votes);

        return $element;
    }

    // ******************************** Helpers **********************************************

    public function isElementRelated(SynthesisElement $element, $object)
    {
        return $element->getLinkedDataClass() === get_class($object) && $element->getLinkedDataId() == $object->getId();
    }

    public function elementIsOutdated(SynthesisElement $element, $object)
    {
        return $object->getUpdatedAt() > $element->getLinkedDataLastUpdate();
    }
}
