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

class ConsultationDownloadResolver
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
            'opinion_title',
            'content_type',
            'opinion_type',
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
            'opinion_title',
            'content_type',
            'opinion_type',
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

    public function __construct(EntityManager $em, TwigEngine $templating, TranslatorInterface $translator)
    {
        $this->em = $em;
        $this->templating = $templating;
        $this->translator = $translator;
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

        $content = $this->templating->render('CapcoAppBundle:Consultation:download.xls.twig',
            array(
                'title' => $consultationStep->getConsultation()->getTitle().'_'.$consultationStep->getTitle(),
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

    public function getData($consultationStep)
    {
        $opinions = $this->em->getRepository('CapcoAppBundle:Opinion')->getEnabledByConsultationStep($consultationStep);
        $versions = $this->em->getRepository('CapcoAppBundle:OpinionVersion')->getEnabledByConsultationStep($consultationStep);
        $arguments = $this->em->getRepository('CapcoAppBundle:Argument')->getEnabledByConsultationStep($consultationStep);
        $sources = $this->em->getRepository('CapcoAppBundle:Source')->getEnabledByConsultationStep($consultationStep);
        $votes = $this->getEnabledVotesByConsultationStep($consultationStep);

        $data = array(
            'published' => array(),
            'unpublished' => array(),
        );

        // 0pinions
        foreach ($opinions as $opinion) {
            $item = $this->getOpinionItem($opinion);
            if ($opinion->getIsEnabled() && !$opinion->getIsTrashed()) {
                $data['published'][] = $item;
            } else {
                $data['unpublished'][] = $item;
            }
            foreach ($opinion->getAppendices() as $appendix) {
                $item = $this->getAppendixItem($opinion, $appendix);
                if ($opinion->getIsEnabled() && !$opinion->getIsTrashed()) {
                    $data['published'][] = $item;
                } else {
                    $data['unpublished'][] = $item;
                }
            }
        }

        // Versions
        foreach ($versions as $version) {
            $item = $this->getOpinionVersionItem($version);
            if ($version->isEnabled() && !$version->getIsTrashed()) {
                $data['published'][] = $item;
            } else {
                $data['unpublished'][] = $item;
            }
            foreach ($version->getArguments() as $argument) {
                $item = $this->getArgumentItem($argument);
                if ($version->isEnabled() && !$version->getIsTrashed()) {
                    $data['published'][] = $item;
                } else {
                    $data['unpublished'][] = $item;
                }
            }
            foreach ($version->getSources() as $source) {
                $item = $this->getSourceItem($source);
                if ($version->isEnabled() && !$version->getIsTrashed()) {
                    $data['published'][] = $item;
                } else {
                    $data['unpublished'][] = $item;
                }
            }
        }

        // Arguments
        foreach ($arguments as $argument) {
            $item = $this->getArgumentItem($argument);
            if ($argument->getIsEnabled() && !$argument->getIsTrashed()) {
                $data['published'][] = $item;
            } else {
                $data['unpublished'][] = $item;
            }
        }

        // Published sources
        foreach ($sources as $source) {
            $item = $this->getSourceItem($source);
            if ($source->getIsEnabled() && !$source->getIsTrashed()) {
                $data['published'][] = $item;
            } else {
                $data['unpublished'][] = $item;
            }
        }

        // Votes
        foreach ($votes as $vote) {
            $item = $this->getVoteItem($vote);
            $data['published'][] = $item;
        }

        return $data;
    }

    private function getOpinionItem(Opinion $opinion)
    {
        return $item = array(
            'opinion_title' => $opinion->getTitle(),
            'content_type' => $this->translator->trans('consultation_download.values.content_type.opinion', array(), 'CapcoAppBundle'),
            'opinion_type' => $opinion->getOpinionType()->getShortName(),
            'category' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'content' => $this->formatText($opinion->getBody()),
            'link' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'created' => $this->dateToString($opinion->getCreatedAt()),
            'updated' => $this->dateToString($opinion->getUpdatedAt()),
            'author' => $opinion->getAuthor()->getUsername(),
            'score' => $this->calculateScore($opinion->getVoteCountOk(), $opinion->getVoteCountMitige(), $opinion->getVoteCountMitige()),
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
            'opinion_title' => $opinion->getTitle(),
            'content_type' => $this->translator->trans('consultation_download.values.content_type.opinion', array(), 'CapcoAppBundle'),
            'opinion_type' => $opinion->getOpinionType()->getShortName(),
            'category' => $appendix->getAppendixType()->getTitle(),
            'content' => $this->formatText($appendix->getBody()),
            'link' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'created' => $this->dateToString($appendix->getCreatedAt()),
            'updated' => $this->dateToString($appendix->getUpdatedAt()),
            'author' => $opinion->getAuthor()->getUsername(),
            'score' => $this->calculateScore($opinion->getVoteCountOk(), $opinion->getVoteCountMitige(), $opinion->getVoteCountMitige()),
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

    private function getOpinionVersionItem(OpinionVersion $version)
    {
        $opinion = $version->getParent();
        return $item = array(
            'opinion_title' => $version->getTitle(),
            'content_type' => $this->translator->trans('consultation_download.values.content_type.opinion_version', array(), 'CapcoAppBundle'),
            'opinion_type' => $opinion->getOpinionType()->getShortName(),
            'category' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'content' => $this->formatText($version->getBody()),
            'link' => $this->translator->trans('consultation_download.values.vote_opinion', array('%name%' => $opinion->getTitle()), 'CapcoAppBundle'),
            'created' => $this->dateToString($version->getCreatedAt()),
            'updated' => $this->dateToString($version->getUpdatedAt()),
            'author' => $version->getAuthor()->getUsername(),
            'score' => $this->calculateScore($version->getVoteCountOk(), $version->getVoteCountMitige(), $opinion->getVoteCountMitige()),
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
        $opinion = $argument->getOpinion() ? $argument->getOpinion() : $argument->getOpinionVersion();
        $item = array(
            'opinion_title' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'content_type' => $this->translator->trans('consultation_download.values.content_type.argument', array(), 'CapcoAppBundle'),
            'opinion_type' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'category' => $this->translator->trans(Argument::$argumentTypesLabels[$argument->getType()], array(), 'CapcoAppBundle'),
            'content' => $this->formatText($argument->getBody()),
            'link' => $this->translator->trans('consultation_download.values.vote_opinion', array('%name%' => $opinion->getTitle()), 'CapcoAppBundle'),
            'created' => $this->dateToString($argument->getCreatedAt()),
            'updated' => $this->dateToString($argument->getUpdatedAt()),
            'author' => $argument->getAuthor()->getUsername(),
            'score' => $this->calculateScore($argument->getVoteCount(), 0, 0),
            'total_votes' => $argument->getVoteCount(),
            'votes_ok' => $argument->getVoteCount(),
            'votes_mitigated' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_nok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'sources' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'total_arguments' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_ok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_nok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'trashed' => $this->booleanToString($argument->getIsTrashed()),
            'trashed_date' => $this->dateToString($argument->getTrashedAt()),
            'trashed_reason' => $argument->getTrashedReason(),
        );
        if ($opinion->getCommentSystem() === OpinionType::COMMENT_SYSTEM_OK) {
            $item['content_type'] = $this->translator->trans('consultation_download.values.content_type.simple_argument', array(), 'CapcoAppBundle');
            $item['category'] = $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle');
        }
        if ($argument->getOpinionVersion()) {
            $item['link'] = $this->translator->trans('consultation_download.values.vote_version', array('%name%' => $opinion->getTitle()), 'CapcoAppBundle');
        }
        return $item;
    }

    private function getSourceItem(Source $source)
    {
        $opinion = $source->getOpinion() ? $source->getOpinion() : $source->getOpinionVersion();
        return $item = array(
            'opinion_title' => $opinion->getTitle(),
            'content_type' => $this->translator->trans('consultation_download.values.content_type.source', array(), 'CapcoAppBundle'),
            'opinion_type' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'category' => $source->getCategory(),
            'content' => $this->formatText($this->getSourceContent($source)),
            'link' => $this->getSourceLink($source),
            'created' => $this->dateToString($source->getCreatedAt()),
            'updated' => $this->dateToString($source->getUpdatedAt()),
            'author' => $source->getAuthor()->getUsername(),
            'score' => $this->calculateScore($source->getVoteCount(), 0, 0),
            'total_votes' => $source->getVoteCount(),
            'votes_ok' => $source->getVoteCount(),
            'votes_mitigated' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_nok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'sources' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'total_arguments' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_ok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_nok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'trashed' => $this->booleanToString($source->getIsTrashed()),
            'trashed_date' => $this->dateToString($source->getTrashedAt()),
            'trashed_reason' => $source->getTrashedReason(),
        );
        if ($source->getOpinionVersion()) {
            $item['link'] = $this->translator->trans('consultation_download.values.vote_version', array('%name%' => $opinion->getTitle()), 'CapcoAppBundle');
        }
    }

    private function getVoteItem($vote)
    {
        return $item = array(
            'opinion_title' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'content_type' => $this->translator->trans('consultation_download.values.content_type.vote', array(), 'CapcoAppBundle'),
            'opinion_type' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'category' => $this->getVoteValue($vote),
            'content' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'link' => $this->getVoteObject($vote),
            'created' => $this->dateToString($vote->getCreatedAt()),
            'updated' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'author' => $vote->getUser()->getUsername(),
            'score' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'total_votes' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_ok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_mitigated' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_nok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'sources' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'total_arguments' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_ok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_nok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'trashed' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'trashed_date' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'trashed_reason' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
        );
    }

    private function getEnabledVotesByConsultationStep($consultationStep)
    {
        $votes = [];
        foreach ($consultationStep->getOpinions() as $opinion) {
            foreach ($opinion->getVotes() as $vote) {
                if ($vote->isConfirmed()) {
                    $votes[] = $vote;
                }
            }
            foreach ($opinion->getArguments() as $argument) {
                foreach ($argument->getVotes() as $vote) {
                    if ($vote->isConfirmed()) {
                        $votes[] = $vote;
                    }
                }
            }
            foreach ($opinion->getSources() as $source) {
                foreach ($source->getVotes() as $vote) {
                    if ($vote->isConfirmed()) {
                        $votes[] = $vote;
                    }
                }
            }
        }

        return $votes;
    }

    private function getVoteValue($vote)
    {
        if (method_exists($vote, 'getValue')) {
            if ($vote->getValue() == -1) {
                return $this->translator->trans('consultation_download.values.votes.nok', array(), 'CapcoAppBundle');
            }
            if ($vote->getValue() == 0) {
                return $this->translator->trans('consultation_download.values.votes.mitige', array(), 'CapcoAppBundle');
            }
            if ($vote->getValue() == 1) {
                return $this->translator->trans('consultation_download.values.votes.ok', array(), 'CapcoAppBundle');
            }

            return $this->translator->trans('consultation_download.values.votes.ok', array(), 'CapcoAppBundle');
        }

        return $this->translator->trans('consultation_download.values.votes.ok', array(), 'CapcoAppBundle');
    }

    private function getVoteObject($vote)
    {
        $object = $vote->getRelatedEntity();
        if ($object instanceof Opinion) {
            return $this->translator->trans('consultation_download.values.vote_opinion', array('%name%' => $object->getTitle()), 'CapcoAppBundle');
        }
        if ($object instanceof Argument) {
            return $this->translator->trans('consultation_download.values.vote_argument', array('%id%' => $object->getId()), 'CapcoAppBundle');
        }
        if ($object instanceof Source) {
            return $this->translator->trans('consultation_download.values.vote_source', array('%name%' => $object->getTitle()), 'CapcoAppBundle');
        }
    }

    private function calculateScore($ok, $mitigated, $nok)
    {
        return $ok - $nok;
    }

    private function getSourceContent($source)
    {
        return $source->getTitle()."\r\n".$source->getBody();
    }

    private function getSourceLink($source)
    {
        if (null != $source->getLink()) {
            return $source->getLink();
        }
        if (null != $source->getMedia()) {
            return $this->translator->trans('consultation_download.values.link.media', array(), 'CapcoAppBundle');
        }

        return '';
    }

    private function booleanToString($boolean)
    {
        if ($boolean) {
            return $this->translator->trans('consultation_download.values.yes', array(), 'CapcoAppBundle');
        }

        return $this->translator->trans('consultation_download.values.no', array(), 'CapcoAppBundle');
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
