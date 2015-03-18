<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Opinion;
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
        'xls'  => 'application/vnd.ms-excel',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'csv'  => 'text/csv',
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
            'enabled',
            'trashed',
            'trashed_date',
            'trashed_reason',
        )
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

    public function getContent($consultation, $format)
    {
        if (null == $consultation) {
            throw new NotFoundHttpException('Consultation not found');
        }

        if (!$this->isFormatSupported($format)) {
            throw new \Exception('Wrong format');
        }

        $data = $this->getData($consultation);

        $content = $this->templating->render('CapcoAppBundle:Consultation:download.xls.twig',
            array(
                'title' => $consultation->getTitle(),
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

    public function getData($consultation)
    {
        $opinions = $this->em->getRepository('CapcoAppBundle:Opinion')->getByConsultation($consultation);
        $arguments = $this->em->getRepository('CapcoAppBundle:Argument')->getByConsultation($consultation);
        $sources = $this->em->getRepository('CapcoAppBundle:Source')->getByConsultation($consultation);

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
            'enabled' => $this->booleanToString($opinion->getIsEnabled()),
            'trashed' => $this->booleanToString($opinion->getIsTrashed()),
            'trashed_date' => $this->dateToString($opinion->getTrashedAt()),
            'trashed_reason' => $opinion->getTrashedReason(),
        );
    }

    private function getArgumentItem(Argument $argument)
    {
        return $item = array(
            'opinion_title' => $argument->getOpinion(),
            'content_type' => $this->translator->trans('consultation_download.values.content_type.argument', array(), 'CapcoAppBundle'),
            'opinion_type' => $argument->getOpinion()->getOpinionType()->getShortName(),
            'category' => $this->translator->trans(Argument::$argumentTypesLabels[$argument->getType()], array(), 'CapcoAppBundle'),
            'content' => $this->formatText($argument->getBody()),
            'link' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
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
            'enabled' => $this->booleanToString($argument->getIsEnabled()),
            'trashed' => $this->booleanToString($argument->getIsTrashed()),
            'trashed_date' => $this->dateToString($argument->getTrashedAt()),
            'trashed_reason' => $argument->getTrashedReason(),
        );

    }

    private function getSourceItem(Source $source)
    {
        return $item = array(
            'opinion_title' => $source->getOpinion(),
            'content_type' => $this->translator->trans('consultation_download.values.content_type.source', array(), 'CapcoAppBundle'),
            'opinion_type' => $source->getOpinion()->getOpinionType()->getShortName(),
            'category' => $source->getCategory(),
            'content' => $this->formatText($this->getSourceContent($source)),
            'link' => $this->getSourceLink($source),
            'created' => $this->dateToString($source->getCreatedAt()),
            'updated' => $this->dateToString($source->getUpdatedAt()),
            'author' => $source->getAuthor()->getUsername(),
            'score' => $this->calculateScore($source->getVoteCountSource(), 0, 0),
            'total_votes' => $source->getVoteCountSource(),
            'votes_ok' => $source->getVoteCountSource(),
            'votes_mitigated' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'votes_nok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'sources' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'total_arguments' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_ok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'arguments_nok' => $this->translator->trans('consultation_download.values.non_applicable', array(), 'CapcoAppBundle'),
            'enabled' => $this->booleanToString($source->getIsEnabled()),
            'trashed' => $this->booleanToString($source->getIsTrashed()),
            'trashed_date' => $this->dateToString($source->getTrashedAt()),
            'trashed_reason' => $source->getTrashedReason(),
        );

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
