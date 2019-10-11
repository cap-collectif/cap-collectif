<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\Step\StepUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Project\QuestionnaireAcknowledgeReplyMessage;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyAdminMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\RouterInterface;

class QuestionnaireReplyNotifier extends BaseNotifier
{
    public const QUESTIONNAIRE_REPLY_CREATE_STATE = 'create';
    public const QUESTIONNAIRE_REPLY_UPDATE_STATE = 'update';
    public const QUESTIONNAIRE_REPLY_DELETE_STATE = 'delete';

    private $stepUrlResolver;
    private $logger;
    private $fmt;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        RouterInterface $router,
        UserResolver $userResolver,
        StepUrlResolver $stepUrlResolver,
        LoggerInterface $logger
    ) {
        $this->stepUrlResolver = $stepUrlResolver;
        $this->logger = $logger;
        $this->fmt = new \IntlDateFormatter(
            $siteParams->getValue('global.locale'),
            \IntlDateFormatter::FULL,
            \IntlDateFormatter::NONE,
            $siteParams->getValue('global.timezone'),
            \IntlDateFormatter::GREGORIAN
        );
        parent::__construct($mailer, $siteParams, $userResolver, $router);
    }

    public function onCreate(Reply $reply): void
    {
        if (!$this->isValidReply($reply)) {
            return;
        }
        $questionnaire = $reply->getQuestionnaire();
        $questionnaireStep = $questionnaire->getStep();
        if (!$reply->getPublishedAt()) {
            $this->logger->error(
                sprintf(
                    '%s : Reply with ID %s must got published date',
                    __METHOD__,
                    $reply->getId()
                )
            );

            return;
        }

        $userUrl = $this->router->generate(
            'capco_user_profile_show_all',
            ['slug' => $reply->getAuthor()->getSlug()],
            RouterInterface::ABSOLUTE_URL
        );
        $configUrl = $this->router->generate(
            'admin_capco_app_questionnaire_edit',
            ['id' => $questionnaire->getId()],
            RouterInterface::ABSOLUTE_URL
        );
        $replyShowUrl = $this->router->generate(
            'admin_capco_app_reply_show',
            ['id' => $reply->getId()],
            RouterInterface::ABSOLUTE_URL
        );

        if ($questionnaire->isNotifyResponseCreate()) {
            $this->mailer->sendMessage(
                QuestionnaireReplyAdminMessage::create(
                    $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                    $reply,
                    $questionnaireStep->getProject()->getTitle(),
                    $questionnaire->getStep()->getTitle(),
                    $reply->getAuthor()->getUsername(),
                    $this->siteParams->getValue('global.site.fullname'),
                    self::QUESTIONNAIRE_REPLY_CREATE_STATE,
                    $userUrl,
                    $configUrl,
                    $this->baseUrl,
                    [
                        'date' => $this->fmt->format($reply->getPublishedAt()->getTimestamp()),
                        'time' => $reply->getPublishedAt()->format('H:i:s'),
                        'endDate' => $this->fmt->format(
                            $reply
                                ->getStep()
                                ->getEndAt()
                                ->getTimestamp()
                        )
                    ],
                    $replyShowUrl
                )
            );
        }

        if ($questionnaire->isAcknowledgeReplies()) {
            $this->mailer->sendMessage(
                QuestionnaireAcknowledgeReplyMessage::create(
                    $reply->getAuthor()->getEmail(),
                    $reply,
                    $questionnaireStep->getProject()->getTitle(),
                    $this->siteParams->getValue('global.site.fullname'),
                    self::QUESTIONNAIRE_REPLY_CREATE_STATE,
                    $userUrl,
                    $configUrl,
                    $this->baseUrl,
                    $this->stepUrlResolver->__invoke($questionnaireStep),
                    $questionnaire->getStep() ? $questionnaire->getStep()->getTitle() : '',
                    [
                        'date' => $this->fmt->format($reply->getPublishedAt()->getTimestamp()),
                        'time' => $reply->getPublishedAt()->format('H:i:s'),
                        'endDate' => $this->fmt->format(
                            $reply
                                ->getStep()
                                ->getEndAt()
                                ->getTimestamp()
                        )
                    ]
                )
            );
        }
    }

    public function onUpdate(Reply $reply): void
    {
        if (!$this->isValidReply($reply)) {
            return;
        }

        $questionnaire = $reply->getQuestionnaire();
        $questionnaireStep = $questionnaire->getStep();

        if (!$reply->getUpdatedAt()) {
            $this->logger->error(
                sprintf(
                    '%s : Reply with ID %s must got updatedAt date',
                    __METHOD__,
                    $reply->getId()
                )
            );

            return;
        }

        $userUrl = $this->router->generate(
            'capco_user_profile_show_all',
            ['slug' => $reply->getAuthor()->getSlug()],
            RouterInterface::ABSOLUTE_URL
        );
        $configUrl = $this->router->generate(
            'admin_capco_app_questionnaire_edit',
            ['id' => $questionnaire->getId()],
            RouterInterface::ABSOLUTE_URL
        );
        $replyShowUrl = $this->router->generate(
            'admin_capco_app_reply_show',
            ['id' => $reply->getId()],
            RouterInterface::ABSOLUTE_URL
        );

        if ($questionnaire->isNotifyResponseUpdate()) {
            $this->mailer->sendMessage(
                QuestionnaireReplyAdminMessage::create(
                    $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                    $reply,
                    $questionnaireStep->getProject()->getTitle(),
                    $questionnaireStep->getTitle(),
                    $reply->getAuthor()->getUsername(),
                    $this->siteParams->getValue('global.site.fullname'),
                    self::QUESTIONNAIRE_REPLY_UPDATE_STATE,
                    $userUrl,
                    $configUrl,
                    $this->baseUrl,
                    [
                        'date' => $this->fmt->format($reply->getUpdatedAt()->getTimestamp()),
                        'time' => $reply->getUpdatedAt()->format('H:i:s'),
                        'endDate' => $this->fmt->format(
                            $reply
                                ->getStep()
                                ->getEndAt()
                                ->getTimestamp()
                        )
                    ],
                    $replyShowUrl
                )
            );
        }
        if ($questionnaire->isAcknowledgeReplies()) {
            $this->mailer->sendMessage(
                QuestionnaireAcknowledgeReplyMessage::create(
                    $reply->getAuthor()->getEmail(),
                    $reply,
                    $questionnaireStep->getProject()->getTitle(),
                    $this->siteParams->getValue('global.site.fullname'),
                    self::QUESTIONNAIRE_REPLY_UPDATE_STATE,
                    $userUrl,
                    $configUrl,
                    $this->baseUrl,
                    $this->stepUrlResolver->__invoke($questionnaireStep),
                    $questionnaireStep->getTitle(),
                    [
                        'date' => $this->fmt->format($reply->getUpdatedAt()->getTimestamp()),
                        'time' => $reply->getUpdatedAt()->format('H:i:s'),
                        'endDate' => $this->fmt->format(
                            $reply
                                ->getStep()
                                ->getEndAt()
                                ->getTimestamp()
                        )
                    ]
                )
            );
        }
    }

    /**
     * @param array $reply
     *                     The reply is an array because a Reply entity doesn't have soft delete
     *                     The array looks like this :
     *                     [
     *                     'author_slug' => string,
     *                     'questionnaire_id' => string,
     *                     'project_title' => string,
     *                     'deleted_at' => string, which will be transformed into a \DateTimeInterface
     *                     'questionnaire_step_title' => string,
     *                     'author_name' => string,
     *                     ]
     *
     * @throws \Exception
     */
    public function onDelete(array $reply): bool
    {
        $userUrl = $this->router->generate(
            'capco_user_profile_show_all',
            ['slug' => $reply['author_slug']],
            RouterInterface::ABSOLUTE_URL
        );
        $configUrl = $this->router->generate(
            'admin_capco_app_questionnaire_edit',
            ['id' => $reply['questionnaire_id']],
            RouterInterface::ABSOLUTE_URL
        );
        $date = \DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $reply['deleted_at']);

        return $this->mailer->sendMessage(
            QuestionnaireReplyAdminMessage::createFromDeletedReply(
                $this->siteParams->getValue('admin.mail.notifications.receive_address'),
                $reply,
                $reply['project_title'],
                $reply['questionnaire_step_title'],
                $reply['author_name'],
                $this->siteParams->getValue('global.site.fullname'),
                self::QUESTIONNAIRE_REPLY_DELETE_STATE,
                $userUrl,
                $configUrl,
                $this->baseUrl,
                [
                    'date' => $this->fmt->format($date->getTimestamp()),
                    'time' => $date->format('H:i:s')
                ]
            )
        );
    }

    private function isValidReply(Reply $reply): bool
    {
        $questionnaire = $reply->getQuestionnaire();
        if (!$questionnaire) {
            $this->logger->error(
                sprintf(
                    '%s : Survey with ID %s dont have questionnaire',
                    __METHOD__,
                    $questionnaire->getId()
                )
            );

            return false;
        }
        $questionnaireStep = $questionnaire->getStep();
        if (!$questionnaireStep) {
            $this->logger->error(
                sprintf(
                    '%s : Survey with ID %s dont have step',
                    __METHOD__,
                    $questionnaire->getId()
                )
            );

            return false;
        }
        if (!$reply->getStep()) {
            $this->logger->error(
                sprintf('%s : Reply with ID %s dont have step', __METHOD__, $reply->getId())
            );

            return false;
        }

        return true;
    }
}
