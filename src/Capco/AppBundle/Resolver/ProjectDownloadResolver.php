<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Enum\MajorityVoteTypeEnum;
use Capco\AppBundle\GraphQL\Resolver\Media\MediaUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireExportResultsUrlResolver;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Collection\Memory\SimpleCache1;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Settings;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\IWriter;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProjectDownloadResolver
{
    final public const PROJECT_ADMIN_EXCLUDED_HEADER_KEYS = ['export_contribution_author_email', 'export_contribution_author_phone'];
    final public const EXPORT_CONTRIBUTION_ID_KEY = 'export_contribution_id';
    final public const EXPORT_CONTRIBUTION_PUBLISHED_KEY = 'export_contribution_published';
    final public const EXPORT_CONTRIBUTION_PUBLISHED_AT_KEY = 'export_contribution_published_at';
    final public const EXPORT_CONTRIBUTION_AUTHOR_KEY = 'export_contribution_author';
    final public const EXPORT_CONTRIBUTION_AUTHOR_ID_KEY = 'export_contribution_author_id';
    final public const EXPORT_CONTRIBUTION_AUTHOR_EMAIL_KEY = 'export_contribution_author_email';
    final public const EXPORT_CONTRIBUTION_AUTHOR_PHONE_KEY = 'export_contribution_author_phone';
    final public const EXPORT_CONTRIBUTION_CREATED_AT_KEY = 'export_contribution_created_at';
    final public const EXPORT_CONTRIBUTION_UPDATED_AT_KEY = 'export_contribution_updated_at';
    final public const EXPORT_CONTRIBUTION_ANONYMOUS_KEY = 'export_contribution_anonymous';
    final public const EXPORT_CONTRIBUTION_DRAFT_KEY = 'export_contribution_draft';
    final public const EXPORT_CONTRIBUTION_UNDRAFT_AT_KEY = 'export_contribution_undraft_at';
    final public const EXPORT_CONTRIBUTION_ACCOUNT_KEY = 'export_contribution_account';
    final public const EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL_KEY = 'export_contribution_no_account_email';
    final public const EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL_CONFIRMED_KEY = 'export_contribution_no_account_email_confirmed';
    final public const EXPORT_CONTRIBUTION_INTERNAL_COMM_KEY = 'export_contribution_internal_comm';
    private const FULL_EXPORT_HEADER_KEYS = [
        self::EXPORT_CONTRIBUTION_PUBLISHED_KEY,
        self::EXPORT_CONTRIBUTION_AUTHOR_KEY,
        self::EXPORT_CONTRIBUTION_AUTHOR_EMAIL_KEY,
        self::EXPORT_CONTRIBUTION_AUTHOR_PHONE_KEY,
        self::EXPORT_CONTRIBUTION_CREATED_AT_KEY,
        self::EXPORT_CONTRIBUTION_UPDATED_AT_KEY,
        self::EXPORT_CONTRIBUTION_ANONYMOUS_KEY,
        self::EXPORT_CONTRIBUTION_DRAFT_KEY,
        self::EXPORT_CONTRIBUTION_UNDRAFT_AT_KEY,
        self::EXPORT_CONTRIBUTION_ACCOUNT_KEY,
        self::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL_KEY,
        self::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL_CONFIRMED_KEY,
        self::EXPORT_CONTRIBUTION_INTERNAL_COMM_KEY,
    ];
    protected array $headers;
    protected array $data;
    protected array $customFields;

    public function __construct(
        protected EntityManagerInterface $em,
        protected TranslatorInterface $translator,
        protected UrlArrayResolver $urlArrayResolver,
        protected MediaUrlResolver $urlResolver,
        protected Spreadsheet $spreadsheet,
        private readonly QuestionnaireExportResultsUrlResolver $exportUrlResolver
    ) {
        $this->headers = [];
        $this->customFields = [];
        $this->data = [];
    }

    public function getQuestionnaireHeaders(
        Questionnaire $questionnaire,
        bool $projectAdmin = false,
        bool $isFullExport = false
    ): array {
        $headers = [
            self::EXPORT_CONTRIBUTION_ID_KEY,
            self::EXPORT_CONTRIBUTION_PUBLISHED_KEY,
            self::EXPORT_CONTRIBUTION_PUBLISHED_AT_KEY,
            self::EXPORT_CONTRIBUTION_AUTHOR_KEY,
            self::EXPORT_CONTRIBUTION_AUTHOR_ID_KEY,
            self::EXPORT_CONTRIBUTION_AUTHOR_EMAIL_KEY,
            self::EXPORT_CONTRIBUTION_AUTHOR_PHONE_KEY,
            self::EXPORT_CONTRIBUTION_CREATED_AT_KEY,
            self::EXPORT_CONTRIBUTION_UPDATED_AT_KEY,
            self::EXPORT_CONTRIBUTION_ANONYMOUS_KEY,
            self::EXPORT_CONTRIBUTION_DRAFT_KEY,
            self::EXPORT_CONTRIBUTION_UNDRAFT_AT_KEY,
            self::EXPORT_CONTRIBUTION_ACCOUNT_KEY,
            self::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL_KEY,
            self::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL_CONFIRMED_KEY,
            self::EXPORT_CONTRIBUTION_INTERNAL_COMM_KEY,
        ];

        if ($projectAdmin) {
            $headers = array_diff($headers, self::PROJECT_ADMIN_EXCLUDED_HEADER_KEYS);
        }

        if (!$isFullExport) {
            $headers = array_diff($headers, self::FULL_EXPORT_HEADER_KEYS);
        }

        $headers = $this->translateHeaders($headers);

        /**
         * @var AbstractQuestion $question
         */
        foreach ($questionnaire->getRealQuestions() as $question) {
            $headers[] = ['label' => $question->getTitle(), 'raw' => true];
        }

        return $headers;
    }

    public function getContent(
        Questionnaire $questionnaire,
        ExportUtils $exportUtils
    ): IWriter {
        $this->headers = $this->getQuestionnaireHeaders($questionnaire);
        $data = $this->getQuestionnaireData($questionnaire);
        $title = $this->exportUrlResolver->getFileName($questionnaire);

        foreach ($data as &$d) {
            foreach ($d as $key => $value) {
                $d[$key] = $exportUtils->parseCellValue($this->formatText($value));
            }
        }

        return $this->getWriterFromData($data, $this->headers, $title);
    }

    // Add item in correct section
    public function addItemToData($item): void
    {
        $this->data[] = $item;
    }

    public function getQuestionnaireData(Questionnaire $questionnaire, bool $projectAdmin = false): array
    {
        $this->data = [];
        $userReplies = $this->em
            ->getRepository(Reply::class)
            ->getEnabledByQuestionnaireAsArray($questionnaire)
        ;

        $anonymousReplies = $this->em
            ->getRepository(ReplyAnonymous::class)
            ->getEnabledByQuestionnaireAsArray($questionnaire)
        ;

        $replies = array_merge($userReplies, $anonymousReplies);

        $this->getRepliesData($replies, $projectAdmin);

        foreach ($this->data as &$answers) {
            foreach ($answers as $key => $value) {
                $answers[$key] = $this->formatText($value);
            }
        }

        return $this->data;
    }

    public function getRepliesData(iterable $replies, bool $projectAdmin = false): void
    {
        foreach ($replies as $reply) {
            $responses = $this->em
                ->getRepository(AbstractResponse::class)
                ->getByReplyAsArray($reply['id'])
            ;
            $this->addItemToData($this->getReplyItem($reply, $responses, $projectAdmin));
        }
    }

    public function formatText($text): string
    {
        $oneBreak = ['<br>', '<br/>', '&nbsp;'];
        $twoBreaks = ['</p>'];
        $text = str_ireplace($oneBreak, "\r", (string) $text);
        $text = str_ireplace($twoBreaks, "\r\n", $text);
        $text = strip_tags($text);

        return html_entity_decode($text, \ENT_QUOTES);
    }

    private function translateHeaders(array $headers): array
    {
        $translatedHeaders = [];

        foreach ($headers as $header) {
            $translatedHeaders[] = $this->translator->trans($header);
        }

        return $translatedHeaders;
    }

    // *************************** Generate items *******************************************

    private function getReplyItem(array $reply, array $responses, bool $projectAdmin = false): array
    {
        $isAnonymousReply = !isset($reply['author']);
        $participantEmail = $isAnonymousReply ? $reply['participantEmail'] : '';
        $participantEmailIsConfirmed = $isAnonymousReply ? ($reply['emailConfirmed'] ? 'Yes' : 'No') : null;

        $item = [
            $this->translator->trans(self::EXPORT_CONTRIBUTION_ID_KEY) => $reply['id'],
            $this->translator->trans(self::EXPORT_CONTRIBUTION_PUBLISHED_KEY) => $this->booleanToString($reply['published']),
            $this->translator->trans(self::EXPORT_CONTRIBUTION_PUBLISHED_AT_KEY) => $this->dateToString($reply['publishedAt']),
            $this->translator->trans(self::EXPORT_CONTRIBUTION_AUTHOR_KEY) => $isAnonymousReply ? '' : $reply['author']['username'],
            $this->translator->trans(self::EXPORT_CONTRIBUTION_AUTHOR_ID_KEY) => $isAnonymousReply ? '' : $reply['author']['id'],
            $this->translator->trans(self::EXPORT_CONTRIBUTION_AUTHOR_EMAIL_KEY) => $isAnonymousReply ? '' : $reply['author']['email'],
            $this->translator->trans(self::EXPORT_CONTRIBUTION_AUTHOR_PHONE_KEY) => (!$isAnonymousReply && $reply['author']['phone']) ? (string) $reply['author']['phone'] : '',
            $this->translator->trans(self::EXPORT_CONTRIBUTION_CREATED_AT_KEY) => $this->dateToString($reply['createdAt']),
            $this->translator->trans(self::EXPORT_CONTRIBUTION_UPDATED_AT_KEY) => $this->dateToString($reply['updatedAt']),
            $this->translator->trans(self::EXPORT_CONTRIBUTION_ANONYMOUS_KEY) => $isAnonymousReply ? '' : $this->booleanToString($reply['private']),
            $this->translator->trans(self::EXPORT_CONTRIBUTION_DRAFT_KEY) => $isAnonymousReply ? '' : $this->booleanToString($reply['draft']),
            $this->translator->trans(self::EXPORT_CONTRIBUTION_UNDRAFT_AT_KEY) => $isAnonymousReply ? '' : $this->dateToString($reply['undraftAt']),
            $this->translator->trans(self::EXPORT_CONTRIBUTION_ACCOUNT_KEY) => $this->booleanToString(!$isAnonymousReply),
            $this->translator->trans(self::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL_KEY) => $participantEmail,
            $this->translator->trans(self::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL_CONFIRMED_KEY) => $participantEmailIsConfirmed,
            $this->translator->trans(self::EXPORT_CONTRIBUTION_INTERNAL_COMM_KEY) => $this->booleanToString(!empty($participantEmail)),
        ];

        if ($projectAdmin) {
            foreach ($this->translateHeaders(self::PROJECT_ADMIN_EXCLUDED_HEADER_KEYS) as $excludedHeader) {
                unset($item[$excludedHeader]);
            }
        }

        foreach ($responses as $response) {
            $question = $response['question'];
            $item[$question['title']] = $this->getResponseValue($response);
        }

        foreach ($this->headers as $header) {
            if (\is_array($header) && !isset($item[$header['label']])) {
                $item[$header['label']] = '';
            }
        }

        return $item;
    }

    private function getResponseValue(array $response)
    {
        $responseMedia = null;
        $mediasUrl = [];
        if ('media' === $response['response_type']) {
            $responseMedia = $this->em->getRepository(MediaResponse::class)->findOneBy([
                'id' => $response['id'],
            ]);

            foreach ($responseMedia->getMedias() as $media) {
                $mediasUrl[] = $this->urlResolver->__invoke(
                    $media,
                    new Argument(['format' => 'reference'])
                );
            }
        }

        $originalValue = $responseMedia ? implode(' ; ', $mediasUrl) : $response['value'];
        if (\is_array($originalValue)) {
            $values = $originalValue['labels'];
            if (isset($originalValue['other'])) {
                $values[] = $originalValue['other'];
            }

            return implode(';', $values);
        }

        if (
            AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION ===
                (int) $response['question']['type']
            && null !== $response['value']
        ) {
            return $this->translator->trans(
                MajorityVoteTypeEnum::toI18nKey($response['value']),
                [],
                'CapcoAppBundle'
            );
        }

        return $originalValue;
    }

    private function getWriterFromData($data, $headers, $title): IWriter
    {
        $this->spreadsheet->getProperties()->setTitle($title);
        $this->spreadsheet->setActiveSheetIndex(0);
        $sheet = $this->spreadsheet->getActiveSheet();
        $sheet->setTitle($this->translator->trans('global.contribution', [], 'CapcoAppBundle'));

        Settings::setCache(
            new SimpleCache1()
        );
        $nbCols = \count($headers);
        // Add headers
        list($startColumn, $startRow) = Coordinate::coordinateFromString('A1');
        $currentColumn = $startColumn;
        foreach ($headers as $header) {
            if (\is_array($header)) {
                $header = $header['label'];
            } elseif (!\in_array($header, $this->customFields, true)) {
                $header = $this->translator->trans(
                    'project_download.label.' . $header,
                    [],
                    'CapcoAppBundle'
                );
            }
            $sheet->setCellValueExplicit([$currentColumn, $startRow], $header, DataType::TYPE_STRING);
            ++$currentColumn;
        }
        list($startColumn, $startRow) = Coordinate::coordinateFromString('A2');
        $currentRow = $startRow;
        // Loop through data
        foreach ($data as $row) {
            $currentColumn = $startColumn;
            for ($i = 0; $i < $nbCols; ++$i) {
                $headerKey = \is_array($headers[$i]) ? $headers[$i]['label'] : $headers[$i];
                $sheet->setCellValue($currentColumn . $currentRow, $row[$headerKey]);
                ++$currentColumn;
            }
            ++$currentRow;
        }

        // create the writer
        return IOFactory::createWriter($this->spreadsheet, 'Xlsx');
    }

    private function booleanToString($boolean): string
    {
        if ($boolean) {
            return 'Yes';
        }

        return 'No';
    }

    private function dateToString(?\DateTime $date = null): string
    {
        if ($date) {
            return $date->format('Y-m-d H:i:s');
        }

        return '';
    }
}
