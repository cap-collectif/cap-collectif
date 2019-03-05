<?php

namespace Capco\AppBundle\Synthesis\Extractor;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Capco\AppBundle\Entity\Synthesis\SynthesisElement;
use Capco\AppBundle\Resolver\OpinionTypesResolver;
use Capco\AppBundle\Resolver\UrlResolver;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Router;
use Symfony\Component\Translation\TranslatorInterface;

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

    public function __construct(
        EntityManagerInterface $em,
        TranslatorInterface $translator,
        Router $router,
        OpinionTypesResolver $opinionTypeResolver,
        UrlResolver $urlResolver
    ) {
        $this->em = $em;
        $this->translator = $translator;
        $this->router = $router;
        $this->opinionTypesResolver = $opinionTypeResolver;
        $this->urlResolver = $urlResolver;
    }

    // *********************************** Main method **********************************

    /**
     * Update or create all elements from consultation step and return updated synthesis.
     */
    public function createOrUpdateElementsFromConsultationStep(
        Synthesis $synthesis,
        ?ConsultationStep $consultationStep
    ): Synthesis {
        if (!$consultationStep) {
            return $synthesis;
        }

        if (!$consultationStep->getIsEnabled()) {
            return $synthesis;
        }

        if (!$consultationStep->getConsultationStepType()) {
            return $synthesis;
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
     * @param mixed $opinionTypes
     */
    public function createElementsFromOpinionTypes($opinionTypes, SynthesisElement $parent = null)
    {
        foreach ($opinionTypes as $opinionType) {
            // Create or update element from opinion type
            $elementFromOT = $this->getRelatedElement($opinionType, $parent);

            // Create elements from opinions
            $opinions = $this->em->getRepository('CapcoAppBundle:Opinion')->findBy([
                'step' => $this->consultationStep,
                'OpinionType' => $opinionType,
            ]);
            if (\count($opinions) > 0) {
                $this->createElementsFromOpinions($opinions, $elementFromOT);
            }

            //Create elements from opinion type children
            $this->createElementsFromOpinionTypes($opinionType->getChildren(), $elementFromOT);
        }
    }

    /**
     * Create or update elements from opinions and all children elements.
     *
     * @param mixed $opinions
     */
    public function createElementsFromOpinions($opinions, SynthesisElement $parent = null)
    {
        foreach ($opinions as $opinion) {
            // Create or update element from opinion
            $elementFromOpinion = $this->getRelatedElement($opinion, $parent);

            // Create elements from arguments
            if (2 === $opinion->getOpinionType()->getCommentSystem()) {
                $proArgumentsElement = $this->createFolderInElement(
                    self::LABEL_ARG_PROS,
                    $elementFromOpinion
                );
                $consArgumentsElement = $this->createFolderInElement(
                    self::LABEL_ARG_CONS,
                    $elementFromOpinion
                );
                $this->createElementsFromArguments(
                    $opinion->getArguments(),
                    $proArgumentsElement,
                    $consArgumentsElement
                );
            } elseif (1 === $opinion->getOpinionType()->getCommentSystem()) {
                $simpleArgumentsElement = $this->createFolderInElement(
                    self::LABEL_ARG_SIMPLE,
                    $elementFromOpinion
                );
                $this->createElementsFromArguments(
                    $opinion->getArguments(),
                    $simpleArgumentsElement
                );
            }

            // Create elements from sources
            if ($opinion->getOpinionType()->isSourceable()) {
                $sourcesElement = $this->createFolderInElement(
                    self::LABEL_SOURCES,
                    $elementFromOpinion
                );
                $this->createElementsFromSources($opinion->getSources(), $sourcesElement);
            }

            // // Create elements from versions
            if ($opinion->getOpinionType()->isVersionable()) {
                $versionsElement = $this->createFolderInElement(
                    self::LABEL_VERSIONS,
                    $elementFromOpinion
                );
                $this->createElementsFromVersions($opinion->getVersions(), $versionsElement);
            }
        }
    }

    /**
     * Create or update elements from versions and all children elements.
     *
     * @param mixed $versions
     */
    public function createElementsFromVersions($versions, SynthesisElement $parent = null)
    {
        foreach ($versions as $version) {
            // Create or update element from version
            $elementFromVersion = $this->getRelatedElement($version, $parent);

            // Create elements from arguments
            $proArgumentsElement = $this->createFolderInElement(
                self::LABEL_ARG_PROS,
                $elementFromVersion
            );
            $consArgumentsElement = $this->createFolderInElement(
                self::LABEL_ARG_CONS,
                $elementFromVersion
            );
            $this->createElementsFromArguments(
                $version->getArguments(),
                $proArgumentsElement,
                $consArgumentsElement
            );

            // Create elements from sources
            $sourcesElement = $this->createFolderInElement(
                self::LABEL_SOURCES,
                $elementFromVersion
            );
            $this->createElementsFromSources($version->getSources(), $sourcesElement);
        }
    }

    /**
     * Create or update elements from arguments and all children elements.
     *
     * @param mixed $arguments
     */
    public function createElementsFromArguments(
        $arguments,
        SynthesisElement $prosFolder,
        SynthesisElement $consFolder = null
    ) {
        foreach ($arguments as $argument) {
            if (1 === $argument->getType() || null !== $consFolder) {
                // Define parent folder
                if (1 === $argument->getType()) {
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
     * @param mixed $sources
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
     * @param mixed $object
     */
    public function getRelatedElement($object, SynthesisElement $parent = null): SynthesisElement
    {
        foreach ($this->previousElements as $element) {
            if ($this->isElementExisting($element, $object)) {
                return $this->isElementOutdated($element, $object)
                    ? $this->updateElementFrom($element, $object)
                    : $element;
            }
        }

        $element = $this->createElementFrom($object);
        $element->setParent($parent);
        $this->synthesis->addElement($element);

        return $element;
    }

    /**
     * Get or create a new folder from a provided parent.
     */
    public function createFolderInElement(
        string $label,
        SynthesisElement $parent
    ): SynthesisElement {
        $label = $this->translator->trans($label, [], 'CapcoAppBundle');

        // Check if folder already exists
        foreach ($parent->getChildren() as $el) {
            if ('folder' === $el->getDisplayType() && $el->getTitle() === $label) {
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

    public function createElementFrom($data): SynthesisElement
    {
        $element = new SynthesisElement();
        $element->setLinkedDataClass(\get_class($data));
        $element->setLinkedDataId($data->getId());
        $element->setLinkedDataCreation($data->getCreatedAt());
        $element->setLinkedDataLastUpdate($data->getUpdatedAt());
        $element->setLinkedDataUrl($this->urlResolver->getObjectUrl($data, true));

        if ($data instanceof OpinionType) {
            $element->setDisplayType('folder');
            $element->setArchived(true);
            $element->setPublished(true);

            return $this->setDataFromOpinionType($element, $data);
        }

        // Contributions from consultation author are automatically published and archived
        $authorIsConsultationAuthor =
            method_exists($data, 'getAuthor') &&
            $data->getAuthor() === $this->consultationStep->getProject()->getAuthor();
        $element->setDisplayType('contribution');
        $element->setArchived($authorIsConsultationAuthor);
        $element->setPublished($authorIsConsultationAuthor);

        return $this->setDataFromContribution($element, $data);
    }

    /**
     * Update an element from a contribution.
     *
     * @param mixed $data
     */
    public function updateElementFrom(SynthesisElement $element, $data): SynthesisElement
    {
        // Update last modified, archive status and deletion date
        $element->setLinkedDataLastUpdate($data->getUpdatedAt());
        if (
            !$this->consultationStep ||
            !method_exists($data, 'getAuthor') ||
            !$this->consultationStep->getProject() ||
            $data->getAuthor() !== $this->consultationStep->getProject()->getAuthor()
        ) {
            $element->setArchived(false);
            $element->setPublished(false);
        }
        if (!$element->getOriginalDivision()) {
            $element->setDeletedAt(null);
        }

        return $this->setDataFromContribution($element, $data);
    }

    /**
     * Set data of element from contribution, depending on type.
     *
     * @param mixed $contribution
     */
    public function setDataFromContribution(
        SynthesisElement $element,
        /*Contribution|OpinionType*/
        $contribution
    ): SynthesisElement {
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

    public function setDataFromOpinionType(
        SynthesisElement $element,
        OpinionType $opinionType
    ): SynthesisElement {
        $element->setAuthor(null);
        $element->setTitle($opinionType->getTitle());
        $element->setSubtitle($opinionType->getSubtitle());
        $element->setBody(null);
        $element->setVotes([]);

        return $element;
    }

    public function setDataFromOpinion(
        SynthesisElement $element,
        Opinion $opinion
    ): SynthesisElement {
        // Set author
        $element->setAuthor($opinion->getAuthor());

        if (!$element->getOriginalDivision()) {
            $element->setTitle($opinion->getTitle());

            $content = '';
            if (\count($opinion->getAppendices()) > 0) {
                $content .=
                    '<p>' .
                    $this->translator->trans(self::LABEL_CONTEXT, [], 'CapcoAppBundle') .
                    '</p>';
                foreach ($opinion->getAppendices() as $app) {
                    $content .= '<p>' . $app->getAppendixType()->getTitle() . '</p>';
                    $content .= $app->getBody();
                }
                $content .=
                    '<p>' .
                    $this->translator->trans(self::LABEL_CONTENT, [], 'CapcoAppBundle') .
                    '</p>';
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

    public function setDataFromVersion(
        SynthesisElement $element,
        OpinionVersion $version
    ): SynthesisElement {
        // Set author
        $element->setAuthor($version->getAuthor());

        if (!$element->getOriginalDivision()) {
            $element->setTitle($version->getTitle());

            $content = '';
            if ($version->getComment()) {
                $content .=
                    '<p>' .
                    $this->translator->trans(self::LABEL_COMMENT, [], 'CapcoAppBundle') .
                    '</p>';
                $content .= $version->getComment();
                $content .=
                    '<p>' .
                    $this->translator->trans(self::LABEL_CONTENT, [], 'CapcoAppBundle') .
                    '</p>';
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

    public function setDataFromSource(SynthesisElement $element, Source $source): SynthesisElement
    {
        // Set author
        $element->setAuthor($source->getAuthor());

        $element->setTitle($source->getTitle());
        $element->setBody($source->getBody());

        // Set link
        if ($source->getMedia()) {
            $mediaURL = $this->router->generate('sonata_media_download', [
                'id' => $source->getMedia()->getId(),
            ]);
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

    public function setDataFromArgument(
        SynthesisElement $element,
        Argument $argument
    ): SynthesisElement {
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

    public function isElementExisting(SynthesisElement $element, $object): bool
    {
        return (
            $element->getLinkedDataClass() === \get_class($object) &&
            (string) $element->getLinkedDataId() === (string) $object->getId()
        );
    }

    public function isElementOutdated(SynthesisElement $element, $object): bool
    {
        return $object->getUpdatedAt() > $element->getLinkedDataLastUpdate();
    }
}
