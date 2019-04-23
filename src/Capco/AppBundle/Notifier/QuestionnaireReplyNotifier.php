<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Questionnaire\QuestionnaireReplyAdminMessage;
use Capco\AppBundle\SiteParameter\Resolver;

class QuestionnaireReplyNotifier extends BaseNotifier
{
    public function __construct(
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver
    ) {
        parent::__construct($mailer, $siteParams, $userResolver);
    }

    public function onCreation(Reply $reply, string $stepUrl): void
    {
        $questionnaire = $reply->getQuestionnaire();
        $step = $questionnaire->getStep();

        $this->mailer->sendMessage(
            QuestionnaireReplyAdminMessage::create(
                $reply,
                $step->getProject()->getTitle(),
                $questionnaire->getTitle(),
                $reply->getAuthor()->getUsername(),
                $reply->getUpdatedAt(),
                $this->siteParams->getValue('global.site.fullname'),
                'create',
                $stepUrl
            )
        );
    }

    public function onUpdate(Reply $reply, string $stepUrl): void
    {
        $questionnaire = $reply->getQuestionnaire();
        $step = $questionnaire->getStep();

        $this->mailer->sendMessage(
            QuestionnaireReplyAdminMessage::create(
                $reply,
                $step->getProject()->getTitle(),
                $questionnaire->getTitle(),
                $reply->getAuthor()->getUsername(),
                $reply->getUpdatedAt(),
                $this->siteParams->getValue('global.site.fullname'),
                'update',
                $stepUrl
            )
        );
    }

    public function onDelete(Reply $reply): void
    {
        $questionnaire = $reply->getQuestionnaire();
        $step = $questionnaire->getStep();

        $this->mailer->sendMessage(
            QuestionnaireReplyAdminMessage::create(
                $reply,
                $step->getProject()->getTitle(),
                $questionnaire->getTitle(),
                $reply->getAuthor()->getUsername(),
                $reply->getUpdatedAt(),
                $this->siteParams->getValue('global.site.fullname'),
                'delete'
            )
        );
    }
}
