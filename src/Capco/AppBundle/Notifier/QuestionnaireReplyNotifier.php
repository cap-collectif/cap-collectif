<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyAdminMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\RouterInterface;

class QuestionnaireReplyNotifier extends BaseNotifier
{
    public const QUESTIONNAIRE_REPLY_CREATE_STATE = 'create';
    public const QUESTIONNAIRE_REPLY_UPDATE_STATE = 'update';
    public const QUESTIONNAIRE_REPLY_DELETE_STATE = 'delete';

    private $baseUrl;

    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        RouterInterface $router,
        UserResolver $userResolver
    ) {
        $this->baseUrl = $router->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL);
        parent::__construct($mailer, $siteParams, $userResolver);
    }

    public function onCreate(Reply $reply, string $stepUrl): bool
    {
        $questionnaire = $reply->getQuestionnaire();
        $step = $questionnaire->getStep();

        return $this->mailer->sendMessage(
            QuestionnaireReplyAdminMessage::create(
                $reply,
                $step->getProject()->getTitle(),
                $questionnaire->getTitle(),
                $reply->getAuthor()->getUsername(),
                $reply->getUpdatedAt(),
                $this->siteParams->getValue('global.site.fullname'),
                self::QUESTIONNAIRE_REPLY_CREATE_STATE,
                $this->baseUrl,
                $stepUrl
            )
        );
    }

    public function onUpdate(Reply $reply, string $stepUrl): bool
    {
        $questionnaire = $reply->getQuestionnaire();
        $step = $questionnaire->getStep();

        return $this->mailer->sendMessage(
            QuestionnaireReplyAdminMessage::create(
                $reply,
                $step->getProject()->getTitle(),
                $questionnaire->getTitle(),
                $reply->getAuthor()->getUsername(),
                $reply->getUpdatedAt(),
                $this->siteParams->getValue('global.site.fullname'),
                self::QUESTIONNAIRE_REPLY_UPDATE_STATE,
                $this->baseUrl,
                $stepUrl
            )
        );
    }

    /**
     * @param array $reply
     *                     The reply is an array because a Reply entity doesn't have soft delete
     *                     The array looks like this :
     *                     [
     *                     'author_email' => string,
     *                     'project_title' => string,
     *                     'deleted_at' => string, which will be transformed into a \DateTimeInterface
     *                     'questionnaire_title' => string,
     *                     'author_name' => string,
     *                     ]
     *
     * @return bool
     *
     * @throws \Exception
     */
    public function onDelete(array $reply): bool
    {
        return $this->mailer->sendMessage(
            QuestionnaireReplyAdminMessage::createFromDeletedReply(
                $reply,
                $reply['project_title'],
                $reply['questionnaire_title'],
                $reply['author_name'],
                $reply['deleted_at'],
                $this->siteParams->getValue('global.site.fullname'),
                self::QUESTIONNAIRE_REPLY_DELETE_STATE,
                $this->baseUrl
            )
        );
    }
}
