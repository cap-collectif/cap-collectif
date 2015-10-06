<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Source;
use Doctrine\ORM\EntityManager;
use Symfony\Bundle\TwigBundle\TwigEngine;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Translation\TranslatorInterface;

class ProjectDownloadResolver
{
    protected $acceptedFormats = array(
        'xls',
        'xlsx',
        'csv',
    );

    protected $contentTypes = array(
        'xls' => 'application/vnd.ms-excel',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'csv' => 'text/csv',
    );

    protected $sheets = array(
        'published',
        'unpublished',
    );

    protected $headers = array(
        'published' => array(
            'title',
            'content_type',
            'related_object',
            'category',
            'content',
            'link',
            'created',
            'updated',
            'author',
            'score',
            'total_votes',
            'votes_ok',
            'votes_mitigated',
            'votes_nok',
            'sources',
            'total_arguments',
            'arguments_ok',
            'arguments_nok',
        ),
        'unpublished' => array(
            'title',
            'content_type',
            'related_object',
            'category',
            'content',
            'link',
            'created',
            'updated',
            'author',
            'score',
            'total_votes',
            'votes_ok',
            'votes_mitigated',
            'votes_nok',
            'sources',
            'total_arguments',
            'arguments_ok',
            'arguments_nok',
            'trashed',
            'trashed_date',
            'trashed_reason',
        ),
    );

    protected $em;
    protected $templating;
    protected $translator;
    protected $data;

    public function __construct(EntityManager $em, TwigEngine $templating, TranslatorInterface $translator)
    {
        $this->em = $em;
        $this->templating = $templating;
        $this->translator = $translator;
        $this->data = [
            'published' => [],
            'unpublished' => [],
        ];
    }

    public function getContent(ConsultationStep $consultationStep, $format)
    {
        if (null == $consultationStep) {
            throw new NotFoundHttpException('Consultation step not found');
        }

        if (!$this->isFormatSupported($format)) {
            throw new \Exception('Wrong format');
        }

        $data = $this->getData($consultationStep);

        $content = $this->templating->render('CapcoAppBundle:Project:download.xls.twig',
            array(
                'title' => $consultationStep->getProject()->getTitle().'_'.$consultationStep->getTitle(),
                'format' => $format,
                'sheets' => $this->sheets,
                'headers' => $this->headers,
                'data' => $data,
            )
        );

        return $content;
    }

    public function isFormatSupported($format)
    {
        return in_array($format, $this->acceptedFormats);
    }

    public function getContentType($format)
    {
        return $this->contentTypes[$format];
    }

    /*
     * Add item in correct section
     */
    public function addItemToData($item, $published)
    {
        if ($published) {
            $this->data['published'][] = $item;
        } else {
            $this->data['unpublished'][] = $item;
        }
    }

    // ********************************** Generate data items **************************************

    public function getData($consultationStep)
    {
        // Opinions
        $opinions = $this->em->getRepository('CapcoAppBundle:Opinion')->getEnabledByConsultationStep($consultationStep);
        $this->getOpinionsData($opinions);
        $opinionsVotes = $this->em->getRepository('CapcoAppBundle:OpinionVote')->getEnabledByConsultationStep($consultationStep);
        $this->getVotesData($opinionsVotes);

        // Versions
        $versions = $this->em->getRepository('CapcoAppBundle:OpinionVersion')->getEnabledByConsultationStep($consultationStep);
        $this->getVersionsData($versions);
        $versionsVotes = $this->em->getRepository('CapcoAppBundle:OpinionVersionVote')->getEnabledByConsultationStep($consultationStep);
        $this->getVotesData($versionsVotes);

        // Arguments
        $arguments = $this->em->getRepository('CapcoAppBundle:Argument')->getEnabledByConsultationStep($consultationStep);
        $this->getArgumentsData($arguments);

        // Sources
        $sources = $this->em->getRepository('CapcoAppBundle:Source')->getEnabledByConsultationStep($consultationStep);
        $this->getSourcesData($sources);

        return $this->data;
    }

    public function getOpinionsData($opinions)
    {
        foreach ($opinions as $opinion) {
            if ($opinion->getIsEnabled()) {
                $this->addItemToData($this->getOpinionItem($opinion), $opinion->isPublished());
                $this->getAppendicesData($opinion->getAppendices());
            }
        }
    }

    public function getAppendicesData($appendices)
    {
        foreach ($appendices as $appendix) {
            $this->addItemToData($this->getAppendixItem($appendix->getOpinion(), $appendix), $appendix->getOpinion()->isPublished());
        }
    }

    public function getVersionsData($versions)
    {
        foreach ($versions as $version) {
            if ($version->isEnabled()) {
                $this->addItemToData($this->getOpinionVersionItem($version), $version->isPublished());
            }
        }
    }

    public function getArgumentsData($arguments)
    {
        foreach ($arguments as $argument) {
            if ($argument->getIsEnabled()) {
                $this->addItemToData($this->getArgumentItem($argument), $argument->isPublished());
                $this->getVotesData($argument->getVotes());
            }
        }
    }

    public function getSourcesData($sources)
    {
        foreach ($sources as $source) {
            if ($source->getIsEnabled()) {
                $this->addItemToData($this->getSourceItem($source), $source->isPublished());
                $this->getVotesData($source->getVotes());
            }
        }
    }

    public function getVotesData($votes)
    {
        foreach ($votes as $vote) {
            if ($vote->isConfirmed()) {
                $this->addItemToData($this->getVoteItem($vote), $vote->getRelatedEntity()->isPublished());
            }
        }
    }

    // *************************** Generate items *******************************************

    private function getOpinionItem(Opinion $opinion)
    {
        return $item = array(
            'title' => $opinion->getTitle(),
            'content_type' => $this->translator->trans('project_download.values.content_type.opinion', array(), 'CapcoAppBundle'),
            'related_object' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'category' => $opinion->getOpinionType()->getTitle(),
            'content' => $this->formatText($opinion->getBody()),
            'link' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'created' => $this->dateToString($opinion->getCreatedAt()),
            'updated' => $this->dateToString($opinion->getUpdatedAt()),
            'author' => $opinion->getAuthor()->getUsername(),
            'score' => $this->calculateScore($opinion->getVoteCountOk(), $opinion->getVoteCountMitige(), $opinion->getVoteCountNok()),
            'total_votes' => $opinion->getVoteCountAll(),
            'votes_ok' => $opinion->getVoteCountOk(),
            'votes_mitigated' => $opinion->getVoteCountMitige(),
            'votes_nok' => $opinion->getVoteCountNok(),
            'sources' => $opinion->getSourcesCount(),
            'total_arguments' => $opinion->getArgumentsCount(),
            'arguments_ok' => $opinion->getArgumentsCountByType('yes'),
            'arguments_nok' => $opinion->getArgumentsCountByType('no'),
            'trashed' => $this->booleanToString($opinion->getIsTrashed()),
            'trashed_date' => $this->dateToString($opinion->getTrashedAt()),
            'trashed_reason' => $opinion->getTrashedReason(),
        );
    }

    private function getAppendixItem(Opinion $opinion, OpinionAppendix $appendix)
    {
        return $item = array(
            'title' => $appendix->getAppendixType()->getTitle(),
            'content_type' => $this->translator->trans('project_download.values.content_type.appendix', array(), 'CapcoAppBundle'),
            'related_object' => $this->translator->trans('project_download.values.related.opinion', array('%name%' => $appendix->getOpinion()->getTitle()), 'CapcoAppBundle'),
            'category' => $appendix->getAppendixType()->getTitle(),
            'content' => $this->formatText($appendix->getBody()),
            'link' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'created' => $this->dateToString($appendix->getCreatedAt()),
            'updated' => $this->dateToString($appendix->getUpdatedAt()),
            'author' => $opinion->getAuthor()->getUsername(),
            'score' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'total_votes' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_ok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_mitigated' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_nok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'sources' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'total_arguments' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_ok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_nok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'trashed' => $this->booleanToString($opinion->getIsTrashed()),
            'trashed_date' => $this->dateToString($opinion->getTrashedAt()),
            'trashed_reason' => $opinion->getTrashedReason(),
        );
    }

    private function getOpinionVersionItem(OpinionVersion $version)
    {
        $opinion = $version->getParent();

        return $item = array(
            'title' => $version->getTitle(),
            'content_type' => $this->translator->trans('project_download.values.content_type.version', array(), 'CapcoAppBundle'),
            'related_object' => $this->translator->trans('project_download.values.related.opinion', array('%name%' => $opinion->getTitle()), 'CapcoAppBundle'),
            'category' => $opinion->getOpinionType()->getTitle(),
            'content' => $this->formatText($version->getBody()),
            'link' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'created' => $this->dateToString($version->getCreatedAt()),
            'updated' => $this->dateToString($version->getUpdatedAt()),
            'author' => $version->getAuthor()->getUsername(),
            'score' => $this->calculateScore($version->getVoteCountOk(), $version->getVoteCountMitige(), $opinion->getVoteCountNok()),
            'total_votes' => $version->getVoteCountAll(),
            'votes_ok' => $version->getVoteCountOk(),
            'votes_mitigated' => $version->getVoteCountMitige(),
            'votes_nok' => $version->getVoteCountNok(),
            'sources' => $version->getSourcesCount(),
            'total_arguments' => $version->getArgumentsCount(),
            'arguments_ok' => $version->getArgumentsCountByType('yes'),
            'arguments_nok' => $version->getArgumentsCountByType('no'),
            'trashed' => $this->booleanToString($version->getIsTrashed()),
            'trashed_date' => $this->dateToString($version->getTrashedAt()),
            'trashed_reason' => $version->getTrashedReason(),
        );
    }

    private function getArgumentItem(Argument $argument)
    {
        $parent = $argument->getOpinion() ? $argument->getOpinion() : $argument->getOpinionVersion();
        $contentType = $parent->getCommentSystem() === OpinionType::COMMENT_SYSTEM_OK
            ? $this->translator->trans('project_download.values.content_type.simple_argument', array(), 'CapcoAppBundle')
            : $this->translator->trans('project_download.values.content_type.argument', array(), 'CapcoAppBundle')
        ;
        $category = $parent->getCommentSystem() === OpinionType::COMMENT_SYSTEM_OK
            ? $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle')
            : $this->translator->trans(Argument::$argumentTypesLabels[$argument->getType()], array(), 'CapcoAppBundle')
        ;
        $relatedObject = $argument->getOpinionVersion()
            ? $this->translator->trans('project_download.values.related.version', array('%name%' => $parent->getTitle()), 'CapcoAppBundle')
            : $this->translator->trans('project_download.values.related.opinion', array('%name%' => $parent->getTitle()), 'CapcoAppBundle')
        ;
        $item = array(
            'title' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'content_type' => $contentType,
            'category' => $category,
            'related_object' => $relatedObject,
            'content' => $this->formatText($argument->getBody()),
            'link' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'created' => $this->dateToString($argument->getCreatedAt()),
            'updated' => $this->dateToString($argument->getUpdatedAt()),
            'author' => $argument->getAuthor()->getUsername(),
            'score' => $this->calculateScore($argument->getVoteCount(), 0, 0),
            'total_votes' => $argument->getVoteCount(),
            'votes_ok' => $argument->getVoteCount(),
            'votes_mitigated' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_nok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'sources' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'total_arguments' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_ok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_nok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'trashed' => $this->booleanToString($argument->getIsTrashed()),
            'trashed_date' => $this->dateToString($argument->getTrashedAt()),
            'trashed_reason' => $argument->getTrashedReason(),
        );

        return $item;
    }

    private function getSourceItem(Source $source)
    {
        $parent = $source->getOpinion() ? $source->getOpinion() : $source->getOpinionVersion();
        $relatedObject = $source->getOpinionVersion()
            ? $this->translator->trans('project_download.values.related.version', array('%name%' => $parent->getTitle()), 'CapcoAppBundle')
            : $this->translator->trans('project_download.values.related.opinion', array('%name%' => $parent->getTitle()), 'CapcoAppBundle')
        ;

        return $item = array(
            'title' => $source->getTitle(),
            'content_type' => $this->translator->trans('project_download.values.content_type.source', array(), 'CapcoAppBundle'),
            'category' => $source->getCategory(),
            'related_object' => $relatedObject,
            'content' => $this->formatText($source->getBody()),
            'link' => $this->getSourceLink($source),
            'created' => $this->dateToString($source->getCreatedAt()),
            'updated' => $this->dateToString($source->getUpdatedAt()),
            'author' => $source->getAuthor()->getUsername(),
            'score' => $this->calculateScore($source->getVoteCount(), 0, 0),
            'total_votes' => $source->getVoteCount(),
            'votes_ok' => $source->getVoteCount(),
            'votes_mitigated' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_nok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'sources' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'total_arguments' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_ok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_nok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'trashed' => $this->booleanToString($source->getIsTrashed()),
            'trashed_date' => $this->dateToString($source->getTrashedAt()),
            'trashed_reason' => $source->getTrashedReason(),
        );
    }

    private function getVoteItem($vote)
    {
        return $item = array(
            'title' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'content_type' => $this->translator->trans('project_download.values.content_type.vote', array(), 'CapcoAppBundle'),
            'related_object' => $this->getVoteObject($vote),
            'category' => $this->getVoteValue($vote),
            'content' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'link' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'created' => $this->dateToString($vote->getUpdatedAt()),
            'updated' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'author' => $vote->getUser()->getUsername(),
            'score' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'total_votes' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_ok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_mitigated' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_nok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'sources' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'total_arguments' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_ok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_nok' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'trashed' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'trashed_date' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'trashed_reason' => $this->translator->trans('project_download.values.non_applicable', array(), 'CapcoAppBundle'),
        );
    }

    private function getVoteValue($vote)
    {
        if (method_exists($vote, 'getValue')) {
            if ($vote->getValue() == -1) {
                return $this->translator->trans('project_download.values.votes.nok', array(), 'CapcoAppBundle');
            }
            if ($vote->getValue() == 0) {
                return $this->translator->trans('project_download.values.votes.mitige', array(), 'CapcoAppBundle');
            }
            if ($vote->getValue() == 1) {
                return $this->translator->trans('project_download.values.votes.ok', array(), 'CapcoAppBundle');
            }
        }

        return $this->translator->trans('project_download.values.votes.ok', array(), 'CapcoAppBundle');
    }

    private function getVoteObject($vote)
    {
        $object = $vote->getRelatedEntity();
        if ($object instanceof Opinion) {
            return $this->translator->trans('project_download.values.related.opinion', array('%name%' => $object->getTitle()), 'CapcoAppBundle');
        }
        if ($object instanceof OpinionVersion) {
            return $this->translator->trans('project_download.values.related.version', array('%name%' => $object->getTitle()), 'CapcoAppBundle');
        }
        if ($object instanceof Argument) {
            return $this->translator->trans('project_download.values.related.argument', array('%id%' => $object->getId()), 'CapcoAppBundle');
        }
        if ($object instanceof Source) {
            return $this->translator->trans('project_download.values.related.source', array('%name%' => $object->getTitle()), 'CapcoAppBundle');
        }
    }

    private function calculateScore($ok, $mitigated, $nok)
    {
        return $ok - $nok;
    }

    private function getSourceLink($source)
    {
        if (null != $source->getLink()) {
            return $source->getLink();
        }
        if (null != $source->getMedia()) {
            return $this->translator->trans('project_download.values.link.media', array(), 'CapcoAppBundle');
        }

        return '';
    }

    private function booleanToString($boolean)
    {
        if ($boolean) {
            return $this->translator->trans('project_download.values.yes', array(), 'CapcoAppBundle');
        }

        return $this->translator->trans('project_download.values.no', array(), 'CapcoAppBundle');
    }

    private function dateToString($date)
    {
        if ($date != null) {
            return $date->format('d-m-Y H:i:s');
        }

        return '';
    }

    private function formatText($text)
    {
        $oneBreak = ['<br>', '<br/>'];
        $twoBreaks = ['</p>'];
        $text = str_ireplace($oneBreak, "\r", $text);
        $text = str_ireplace($twoBreaks, "\r\n", $text);
        $text = strip_tags($text);

        return $text;
    }
}
