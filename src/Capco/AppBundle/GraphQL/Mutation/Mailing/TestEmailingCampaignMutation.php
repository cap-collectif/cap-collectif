<?php

namespace Capco\AppBundle\GraphQL\Mutation\Mailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\EmailingCampaign\AbstractEmailingCampaignMessage;
use Capco\AppBundle\Mailer\Message\EmailingCampaign\TestEmailingCampaignMessage;
use Capco\AppBundle\Security\EmailingCampaignVoter;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Twig\Environment;

class TestEmailingCampaignMutation extends AbstractEmailingCampaignMutation
{
    use MutationTrait;

    public function __construct(
        GlobalIdResolver $resolver,
        EntityManagerInterface $entityManager,
        AuthorizationCheckerInterface $authorizationChecker,
        private readonly MailerService $mailerService,
        private readonly SiteParameterResolver $siteParams,
        private readonly RouterInterface $router,
        private readonly Environment $twig
    ) {
        parent::__construct($resolver, $entityManager, $authorizationChecker);
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $error = null;
        $html = null;

        try {
            $emailingCampaign = $this->getSendableCampaign($input, $viewer);
            $testEmail = $this->getTestEmail($input);
            $html = $this->sendEmailAndGetHTML(
                $this->createTestEmail($testEmail, $emailingCampaign)
            );
        } catch (UserError $exception) {
            $html = null;
            $error = $exception->getMessage();
        }

        return compact('html', 'error');
    }

    public function isGranted(string $id, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        $emailCampaign = $this->findCampaignFromGlobalId($id, $viewer);
        if (!$emailCampaign) {
            return false;
        }

        return $this->authorizationChecker->isGranted(EmailingCampaignVoter::TEST, $emailCampaign);
    }

    /**
     * @TODO : add user_locale to localize email
     */
    private function createTestEmail(
        string $testReceipt,
        EmailingCampaign $emailingCampaign
    ): TestEmailingCampaignMessage {
        return new TestEmailingCampaignMessage($testReceipt, $emailingCampaign, [
            'baseUrl' => $this->router->generate('app_homepage'),
            'siteUrl' => $this->router->generate('app_homepage'),
            'siteName' => $this->siteParams->getValue('global.site.fullname'),
            'unsubscribeUrl' => $this->router->generate('app_homepage'),
        ]);
    }

    private function sendEmailAndGetHTML(AbstractEmailingCampaignMessage $message): string
    {
        $this->mailerService->sendMessage($message);
        $context = $message->getTemplateVars();
        $context['user_locale'] = '';

        return $this->twig->render($message->getTemplate(), $context);
    }

    private function getTestEmail(Argument $input): string
    {
        return $input->offsetGet('email');
    }
}
