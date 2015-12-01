<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Source;
use Doctrine\ORM\EntityManager;
use Symfony\Bundle\TwigBundle\TwigEngine;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Translation\TranslatorInterface;

class ProjectDownloadResolver
{
    protected $acceptedFormats = [
        'xls',
        'xlsx',
        'csv',
    ];

    protected $contentTypes = [
        'xls'  => 'application/vnd.ms-excel',
        'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'csv'  => 'text/csv',
    ];

    protected $sheets = [
        'published',
        'unpublished',
    ];

    protected $consultationHeaders = [
        'published' => [
            'id',
            'author',
            'author_id',
            'user_type',
            'created',
            'updated',
            'title',
            'content_type',
            'category',
            'related_object',
            'content',
            'link',
            'score',
            'total_votes',
            'votes_ok',
            'votes_mitigated',
            'votes_nok',
            'sources',
            'total_arguments',
            'arguments_ok',
            'arguments_nok',
        ],
        'unpublished' => [
            'id',
            'author',
            'author_id',
            'user_type',
            'created',
            'updated',
            'title',
            'content_type',
            'category',
            'related_object',
            'content',
            'link',
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
        ],
    ];

    protected $collectHeaders = [
        'published' => [
            'id',
            'title',
            'author',
            'author_id',
            'author_email',
            'user_type',
            'content',
            'theme',
            'district',
            'status',
            'created',
            'updated',
            'link',
        ],
        'unpublished' => [
            'id',
            'title',
            'author',
            'author_id',
            'author_email',
            'user_type',
            'content',
            'theme',
            'district',
            'status',
            'created',
            'updated',
            'link',
            'trashed',
            'trashed_date',
            'trashed_reason',
        ],
    ];

    protected $em;
    protected $templating;
    protected $translator;
    protected $urlResolver;
    protected $data;

    public function __construct(EntityManager $em, TwigEngine $templating, TranslatorInterface $translator, UrlResolver $urlResolver)
    {
        $this->em = $em;
        $this->templating = $templating;
        $this->translator = $translator;
        $this->urlResolver = $urlResolver;
        $this->data = [
            'published'   => [],
            'unpublished' => [],
        ];
    }

    public function getContent(AbstractStep $step, $format)
    {
        if (null == $step) {
            throw new NotFoundHttpException('Step not found');
        }

        if (!$this->isFormatSupported($format)) {
            throw new \Exception('Wrong format');
        }

        $data = [];
        $headers = [];

        if ($step instanceof ConsultationStep) {
            $data = $this->getConsultationStepData($step);
            $headers = $this->consultationHeaders;
        } elseif ($step instanceof CollectStep) {
            $data = $this->getCollectStepData($step);
            $headers = $this->collectHeaders;
        } else {
            throw new \Exception('Step must be of type collect or consultation');
        }

        $content = $this->templating->render('CapcoAppBundle:Project:download.xls.twig',
            [
                'title'   => $step->getProject()->getTitle().'_'.$step->getTitle(),
                'format'  => $format,
                'sheets'  => $this->sheets,
                'headers' => $headers,
                'data'    => $data,
                'locale'  => $this->translator->getLocale(),
            ]
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

    public function getConsultationStepData(ConsultationStep $consultationStep)
    {
        echo "Exporting step ".$consultationStep->getTitle()."\n";

        $this->data = [
            'published'   => [],
            'unpublished' => [],
        ];

        // Fetch data
        echo "Fetching elements\n";
        $opinions = $this->em->getRepository('CapcoAppBundle:Opinion')->getEnabledByConsultationStep($consultationStep);
        echo "Opinions : ".count($opinions)."\n";
        $opinionsVotes = $this->em->getRepository('CapcoAppBundle:OpinionVote')->getEnabledByConsultationStep($consultationStep);
        $versions = $this->em->getRepository('CapcoAppBundle:OpinionVersion')->getEnabledByConsultationStep($consultationStep);
        echo "Versions : ".count($versions)."\n";
        $versionsVotes = $this->em->getRepository('CapcoAppBundle:OpinionVersionVote')->getEnabledByConsultationStep($consultationStep);
        echo "Votes (opinions + versions only) : ".(count($opinionsVotes) + count($versionsVotes))."\n";
        $arguments = $this->em->getRepository('CapcoAppBundle:Argument')->getEnabledByConsultationStep($consultationStep);
        echo "Arguments : ".count($arguments)."\n";
        $sources = $this->em->getRepository('CapcoAppBundle:Source')->getEnabledByConsultationStep($consultationStep);
        echo "Sources : ".count($sources)."\n";

        // Create items from data
        $this->getOpinionsData($opinions);
        $this->getVotesData($opinionsVotes);
        $this->getVersionsData($versions);
        $this->getVotesData($versionsVotes);
        $this->getArgumentsData($arguments);
        $this->getSourcesData($sources);

        return $this->data;
    }

    public function getCollectStepData(CollectStep $collectStep)
    {
        echo "Exporting step ".$collectStep->getTitle()."\n";

        $this->data = [
            'published'   => [],
            'unpublished' => [],
        ];

        // Proposals
        echo "Fetching elements\n";
        $proposals = $this->em
            ->getRepository('CapcoAppBundle:Proposal')
            ->getEnabledByProposalForm($collectStep->getProposalForm(), 0, null);
        echo "Proposals : ".count($proposals)."\n";

        $this->getProposalsData($proposals);

        return $this->data;
    }

    public function getProposalsData($proposals)
    {
        foreach ($proposals as $proposal) {
            if ($proposal->isEnabled()) {
                $this->addItemToData($this->getProposalItem($proposal), !$proposal->getIsTrashed());
            }
        }
    }

    public function getOpinionsData($opinions)
    {
        foreach ($opinions as $opinion) {
            if ($opinion->getIsEnabled()) {
                $this->addItemToData($this->getOpinionItem($opinion), $opinion->isPublished());
            }
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

    private function getProposalItem(Proposal $proposal)
    {
        return $item = [
            'id'             => $proposal->getId(),
            'title'          => $proposal->getTitle(),
            'content'        => $this->getProposalContent($proposal),
            'link'           => $this->urlResolver->getObjectUrl($proposal, true),
            'created'        => $this->dateToString($proposal->getCreatedAt()),
            'updated'        => $proposal->getUpdatedAt() != $proposal->getCreatedAt() ? $this->dateToString($proposal->getUpdatedAt()) : null,
            'author'         => $proposal->getAuthor()->getUsername(),
            'author_id'      => $proposal->getAuthor()->getId(),
            'author_email'   => $proposal->getAuthor()->getEmail(),
            'user_type'      => $proposal->getAuthor()->getUserType() ? $proposal->getAuthor()->getUserType()->getName() : '',
            'trashed'        => $this->booleanToString($proposal->getIsTrashed()),
            'trashed_date'   => $this->dateToString($proposal->getTrashedAt()),
            'trashed_reason' => $proposal->getTrashedReason(),
            'theme'          => $proposal->getTheme() ? $proposal->getTheme()->getTitle() : '',
            'district'       => $proposal->getDistrict() ? $proposal->getDistrict()->getName() : '',
            'status'         => $proposal->getStatus() ? $proposal->getStatus()->getName() : '',
        ];
    }

    private function getOpinionItem(Opinion $opinion)
    {
        return $item = [
            'id'              => $opinion->getId(),
            'title'           => $opinion->getTitle(),
            'content_type'    => $this->translator->trans('project_download.values.content_type.opinion', [], 'CapcoAppBundle'),
            'related_object'  => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'category'        => $this->getOpinionParents($opinion),
            'content'         => $this->getOpinionContent($opinion),
            'link'            => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'created'         => $this->dateToString($opinion->getCreatedAt()),
            'updated'         => $opinion->getUpdatedAt() != $opinion->getCreatedAt() ? $this->dateToString($opinion->getUpdatedAt()) : null,
            'author'          => $opinion->getAuthor()->getUsername(),
            'author_id'       => $opinion->getAuthor()->getId(),
            'user_type'       => $opinion->getAuthor()->getUserType() ? $opinion->getAuthor()->getUserType()->getName() : '',
            'score'           => $this->calculateScore($opinion->getVotesCountOk(), $opinion->getVotesCountMitige(), $opinion->getVotesCountNok()),
            'total_votes'     => $opinion->getVotesCountAll(),
            'votes_ok'        => $opinion->getVotesCountOk(),
            'votes_mitigated' => $opinion->getVotesCountMitige(),
            'votes_nok'       => $opinion->getVotesCountNok(),
            'sources'         => $opinion->getSourcesCount(),
            'total_arguments' => $opinion->getArgumentsCount(),
            'arguments_ok'    => $opinion->getArgumentsCountByType('yes'),
            'arguments_nok'   => $opinion->getArgumentsCountByType('no'),
            'trashed'         => $this->booleanToString($opinion->getIsTrashed()),
            'trashed_date'    => $this->dateToString($opinion->getTrashedAt()),
            'trashed_reason'  => $opinion->getTrashedReason(),
        ];
    }

    private function getOpinionVersionItem(OpinionVersion $version)
    {
        $opinion = $version->getParent();

        return $item = [
            'id'              => $version->getId(),
            'title'           => $version->getTitle(),
            'content_type'    => $this->translator->trans('project_download.values.content_type.version', [], 'CapcoAppBundle'),
            'related_object'  => $this->translator->trans('project_download.values.related.opinion', ['%id%' => $opinion->getId()], 'CapcoAppBundle'),
            'category'        => $this->getOpinionParents($opinion),
            'content'         => $this->formatText($version->getBody()),
            'link'            => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'created'         => $this->dateToString($version->getCreatedAt()),
            'updated'         => $version->getUpdatedAt() != $version->getCreatedAt() ? $this->dateToString($version->getUpdatedAt()) : null,
            'author'          => $version->getAuthor()->getUsername(),
            'author_id'       => $version->getAuthor()->getId(),
            'user_type'       => $version->getAuthor()->getUserType() ? $version->getAuthor()->getUserType()->getName() : '',
            'score'           => $this->calculateScore($version->getVotesCountOk(), $version->getVotesCountMitige(), $opinion->getVotesCountNok()),
            'total_votes'     => $version->getVotesCountAll(),
            'votes_ok'        => $version->getVotesCountOk(),
            'votes_mitigated' => $version->getVotesCountMitige(),
            'votes_nok'       => $version->getVotesCountNok(),
            'sources'         => $version->getSourcesCount(),
            'total_arguments' => $version->getArgumentsCount(),
            'arguments_ok'    => $version->getArgumentsCountByType('yes'),
            'arguments_nok'   => $version->getArgumentsCountByType('no'),
            'trashed'         => $this->booleanToString($version->getIsTrashed()),
            'trashed_date'    => $this->dateToString($version->getTrashedAt()),
            'trashed_reason'  => $version->getTrashedReason(),
        ];
    }

    private function getArgumentItem(Argument $argument)
    {
        $parent = $argument->getOpinion() ? $argument->getOpinion() : $argument->getOpinionVersion();
        $contentType = $parent->getCommentSystem() === OpinionType::COMMENT_SYSTEM_OK
            ? $this->translator->trans('project_download.values.content_type.simple_argument', [], 'CapcoAppBundle')
            : $this->translator->trans('project_download.values.content_type.argument', [], 'CapcoAppBundle')
        ;
        $category = $parent->getCommentSystem() === OpinionType::COMMENT_SYSTEM_OK
            ? $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle')
            : $this->translator->trans(Argument::$argumentTypesLabels[$argument->getType()], [], 'CapcoAppBundle')
        ;
        $relatedObject = $argument->getOpinionVersion()
            ? $this->translator->trans('project_download.values.related.version', ['%id%' => $parent->getId()], 'CapcoAppBundle')
            : $this->translator->trans('project_download.values.related.opinion', ['%id%' => $parent->getId()], 'CapcoAppBundle')
        ;
        $item = [
            'id'              => $argument->getId(),
            'title'           => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'content_type'    => $contentType,
            'category'        => $category,
            'related_object'  => $relatedObject,
            'content'         => $this->formatText($argument->getBody()),
            'link'            => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'created'         => $this->dateToString($argument->getCreatedAt()),
            'updated'         => $argument->getUpdatedAt() != $argument->getCreatedAt() ? $this->dateToString($argument->getUpdatedAt()) : null,
            'author'          => $argument->getAuthor()->getUsername(),
            'author_id'       => $argument->getAuthor()->getId(),
            'user_type'       => $argument->getAuthor()->getUserType() ? $argument->getAuthor()->getUserType()->getName() : '',
            'score'           => $this->calculateScore($argument->getVotesCount(), 0, 0),
            'total_votes'     => $argument->getVotesCount(),
            'votes_ok'        => $argument->getVotesCount(),
            'votes_mitigated' => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'votes_nok'       => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'sources'         => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'total_arguments' => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'arguments_ok'    => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'arguments_nok'   => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'trashed'         => $this->booleanToString($argument->getIsTrashed()),
            'trashed_date'    => $this->dateToString($argument->getTrashedAt()),
            'trashed_reason'  => $argument->getTrashedReason(),
        ];

        return $item;
    }

    private function getSourceItem(Source $source)
    {
        $parent = $source->getOpinion() ? $source->getOpinion() : $source->getOpinionVersion();
        $relatedObject = $source->getOpinionVersion()
            ? $this->translator->trans('project_download.values.related.version', ['%id%' => $parent->getId()], 'CapcoAppBundle')
            : $this->translator->trans('project_download.values.related.opinion', ['%id%' => $parent->getId()], 'CapcoAppBundle')
        ;

        return $item = [
            'id'              => $source->getId(),
            'title'           => $source->getTitle(),
            'content_type'    => $this->translator->trans('project_download.values.content_type.source', [], 'CapcoAppBundle'),
            'category'        => $source->getCategory(),
            'related_object'  => $relatedObject,
            'content'         => $this->formatText($source->getBody()),
            'link'            => $this->getSourceLink($source),
            'created'         => $this->dateToString($source->getCreatedAt()),
            'updated'         => $source->getUpdatedAt() != $source->getCreatedAt() ? $this->dateToString($source->getUpdatedAt()) : null,
            'author'          => $source->getAuthor()->getUsername(),
            'author_id'       => $source->getAuthor()->getId(),
            'user_type'       => $source->getAuthor()->getUserType() ? $source->getAuthor()->getUserType()->getName() : '',
            'score'           => $this->calculateScore($source->getVotesCount(), 0, 0),
            'total_votes'     => $source->getVotesCount(),
            'votes_ok'        => $source->getVotesCount(),
            'votes_mitigated' => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'votes_nok'       => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'sources'         => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'total_arguments' => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'arguments_ok'    => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'arguments_nok'   => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'trashed'         => $this->booleanToString($source->getIsTrashed()),
            'trashed_date'    => $this->dateToString($source->getTrashedAt()),
            'trashed_reason'  => $source->getTrashedReason(),
        ];
    }

    private function getVoteItem($vote)
    {
        return $item = [
            'id'              => '',
            'title'           => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'content_type'    => $this->translator->trans('project_download.values.content_type.vote', [], 'CapcoAppBundle'),
            'related_object'  => $this->getVoteObject($vote),
            'category'        => $this->getVoteValue($vote),
            'content'         => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'link'            => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'created'         => $this->dateToString($vote->getUpdatedAt()),
            'updated'         => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'author'          => $vote->getUser()->getUsername(),
            'author_id'       => $vote->getUser()->getId(),
            'user_type'       => $vote->getUser()->getUserType() ? $vote->getUser()->getUserType()->getName() : '',
            'score'           => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'total_votes'     => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'votes_ok'        => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'votes_mitigated' => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'votes_nok'       => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'sources'         => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'total_arguments' => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'arguments_ok'    => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'arguments_nok'   => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'trashed'         => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'trashed_date'    => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
            'trashed_reason'  => $this->translator->trans('project_download.values.non_applicable', [], 'CapcoAppBundle'),
        ];
    }

    private function getVoteValue($vote)
    {
        if (method_exists($vote, 'getValue')) {
            if ($vote->getValue() == -1) {
                return $this->translator->trans('project_download.values.votes.nok', [], 'CapcoAppBundle');
            }
            if ($vote->getValue() == 0) {
                return $this->translator->trans('project_download.values.votes.mitige', [], 'CapcoAppBundle');
            }
            if ($vote->getValue() == 1) {
                return $this->translator->trans('project_download.values.votes.ok', [], 'CapcoAppBundle');
            }
        }

        return $this->translator->trans('project_download.values.votes.ok', [], 'CapcoAppBundle');
    }

    private function getVoteObject($vote)
    {
        $object = $vote->getRelatedEntity();
        if ($object instanceof Opinion) {
            return $this->translator->trans('project_download.values.related.opinion', ['%id%' => $object->getId()], 'CapcoAppBundle');
        }
        if ($object instanceof OpinionVersion) {
            return $this->translator->trans('project_download.values.related.version', ['%id%' => $object->getId()], 'CapcoAppBundle');
        }
        if ($object instanceof Argument) {
            return $this->translator->trans('project_download.values.related.argument', ['%id%' => $object->getId()], 'CapcoAppBundle');
        }
        if ($object instanceof Source) {
            return $this->translator->trans('project_download.values.related.source', ['%id%' => $object->getId()], 'CapcoAppBundle');
        }
    }

    private function calculateScore($ok, $mitigated, $nok)
    {
        return $ok - $nok;
    }

    private function getOpinionContent(Opinion $opinion)
    {
        $body = $this->formatText(html_entity_decode($opinion->getBody()));
        if (count($opinion->getAppendices()) > 0) {
            $body .= "\n".$this->translator->trans('project_download.values.appendices.title', [], 'CapcoAppBundle');
            foreach ($opinion->getAppendices() as $app) {
                $body .= "\n".$app->getAppendixType()->getTitle().' :';
                $body .= "\n".$this->formatText($app->getBody());
            }
        }

        return $body;
    }

    private function getProposalContent(Proposal $proposal)
    {
        $body = $this->formatText(html_entity_decode($proposal->getBody()));
        foreach ($proposal->getProposalResponses() as $response) {
            $body .= "\n\n".$response->getQuestion()->getTitle().' :';
            $body .= "\n".$this->formatText($response->getValue());
        }

        return $body;
    }

    private function getOpinionParents(Opinion $opinion)
    {
        $parents = [$opinion->getOpinionType()->getTitle()];

        $current = $opinion->getOpinionType();
        while ($current->getParent()) {
            $current = $current->getParent();
            $parents[] = $current->getTitle();
        }

        return implode(' - ', array_reverse($parents));
    }

    private function getSourceLink($source)
    {
        if (null != $source->getLink()) {
            return $source->getLink();
        }
        if (null != $source->getMedia()) {
            return $this->translator->trans('project_download.values.link.media', [], 'CapcoAppBundle');
        }

        return '';
    }

    private function booleanToString($boolean)
    {
        if ($boolean) {
            return $this->translator->trans('project_download.values.yes', [], 'CapcoAppBundle');
        }

        return $this->translator->trans('project_download.values.no', [], 'CapcoAppBundle');
    }

    private function dateToString($date)
    {
        if ($date != null) {
            return $date->format('Y-m-d H:i:s');
        }

        return '';
    }

    private function formatText($text)
    {
        $oneBreak = ['<br>', '<br/>', '&nbsp;'];
        $twoBreaks = ['</p>'];
        $text = str_ireplace($oneBreak, "\r", $text);
        $text = str_ireplace($twoBreaks, "\r\n", $text);
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES);

        return $text;
    }
}
