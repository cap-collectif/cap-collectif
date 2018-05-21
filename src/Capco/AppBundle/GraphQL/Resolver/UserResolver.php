<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\UserBundle\Entity\User;
use FOS\UserBundle\Model\UserInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class UserResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveUserType()
    {
        $typeResolver = $this->container->get('overblog_graphql.type_resolver');

        return $typeResolver->resolve('user');
    }

    public function resolve(Arg $args)
    {
        $repo = $this->container->get('capco.user.repository');
        if (isset($args['id'])) {
            return [$repo->find($args['id'])];
        }

        if (isset($args['superAdmin']) && true === $args['superAdmin']) {
            return [$repo->getAllUsersWithoutSuperAdmin()];
        }

        return $repo->findAll();
    }

    public function resolveResettingPassworldUrl(UserInterface $user): string
    {
        $router = $this->container->get('router');

        return $router->generate('fos_user_resetting_reset', ['token' => $user->getConfirmationToken()],
            UrlGeneratorInterface::ABSOLUTE_URL);
    }

    public function resolveRegistrationConfirmationUrl(UserInterface $user): string
    {
        $router = $this->container->get('router');

        return $router->generate('account_confirm_email', ['token' => $user->getConfirmationToken()],
            UrlGeneratorInterface::ABSOLUTE_URL);
    }

    public function resolveConfirmNewEmailUrl(User $user, $absolute = true): string
    {
        $router = $this->container->get('router');

        return $router->generate('account_confirm_new_email', ['token' => $user->getNewEmailConfirmationToken()],
            UrlGeneratorInterface::ABSOLUTE_URL);
    }

    public function resolveEmail($object): string
    {
        if (0 === strpos($object->getEmail(), 'twitter_')) {
            return '';
        }

        return $object->getEmail();
    }

    public function resolveCreatedAt($object): string
    {
        return $object->getCreatedAt() ? $object->getCreatedAt()->format(\DateTime::ATOM) : '';
    }

    public function resolveShowUrl(User $user): string
    {
        $router = $this->container->get('router');

        return $router->generate('capco_user_profile_show_all', ['slug' => $user->getSlug()], UrlGeneratorInterface::ABSOLUTE_URL);
    }

    public function resolveShowNotificationsPreferencesUrl(): string
    {
        $router = $this->container->get('router');

        return $router->generate('capco_profile_notifications_edit_account', [], UrlGeneratorInterface::ABSOLUTE_URL);
    }

    public function resolveDisableNotificationsUrl(User $user): string
    {
        $router = $this->container->get('router');

        return $router->generate('capco_profile_notifications_disable',
            ['token' => $user->getNotificationsConfiguration()->getUnsubscribeToken()], UrlGeneratorInterface::ABSOLUTE_URL);
    }

    public function resolveLoginAndShowDataUrl(User $user): string
    {
        $router = $this->container->get('router');

        return $router->generate('capco_profile_data_login',
            ['token' => $user->getNotificationsConfiguration()->getUnsubscribeToken()], UrlGeneratorInterface::ABSOLUTE_URL);
    }

    public function resolveShowUrlBySlug(string $slug)
    {
        $router = $this->container->get('router');

        return $router->generate('capco_user_profile_show_all', compact('slug'),
            UrlGeneratorInterface::ABSOLUTE_URL);
    }

    public function resolveUpdatedAt($object): string
    {
        return $object->getUpdatedAt() ? $object->getUpdatedAt()->format(\DateTime::ATOM) : '';
    }

    public function resolveDateOfBirth($object): string
    {
        return $object->getDateOfBirth() ? $object->getDateOfBirth()->format(\DateTime::ATOM) : '';
    }

    public function resolvePhoneConfirmationSentAt($object): string
    {
        return $object->getSmsConfirmationSentAt() ? $object->getSmsConfirmationSentAt()->format(\DateTime::ATOM) : '';
    }

    public function resolveLastLogin($object): string
    {
        return $object->getLastLogin() ? $object->getLastLogin()->format(\DateTime::ATOM) : '';
    }

    public function resolveRolesText($object): string
    {
        $convertedRoles = array_map(function ($role) {
            return str_replace(
                ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'],
                ['Utilisateur', 'Administrateur', 'Super Admin'],
                $role
            );
        }, $object->getRoles());

        return implode('|', $convertedRoles);
    }

    public function resolveGender($object): string
    {
        if ('u' === $object->getGender()) {
            return 'Non communiqué';
        }
        if ('m' === $object->getGender()) {
            return 'Homme';
        }

        return 'Femme';
    }

    public function contributionsToDeleteCount($object): int
    {
        $now = (new \DateTime())->format('Y-m-d H:i:s');
        $count = 0;

        foreach ($object->getContributions() as $contribution) {
            if ($contribution instanceof AbstractVote) {
                if (!$contribution instanceof CommentVote) {
                    if (method_exists($contribution->getRelatedEntity(), 'getStep') && $this->checkIfStepActive($contribution->getRelatedEntity()->getStep())) {
                        ++$count;
                    }
                } else {
                    if ($contribution->getComment() instanceof ProposalComment) {
                        if (method_exists($contribution->getComment()->getRelatedObject()->getProposalForm(), 'getStep') && $this->checkIfStepActive($contribution->getComment()->getRelatedObject()->getProposalForm()->getStep())) {
                            ++$count;
                        }
                    } elseif ($contribution->getComment() instanceof EventComment) {
                        if ($contribution->getComment()->getEvent()->getEndAt() > $now) {
                            ++$count;
                        }
                    }
                }
            }

            if ($contribution instanceof Proposal && $this->checkIfStepActive($contribution->getStep())) {
                ++$count;
            }

            if ($contribution instanceof Source || $contribution instanceof \Capco\AppBundle\Entity\Argument) {
                if (method_exists($contribution->getOpinion(), 'getStep') && $this->checkIfStepActive($contribution->getOpinion()->getStep())) {
                    ++$count;
                }
            }
        }

        return $count;
    }

    public function checkIfStepActive(AbstractStep $step): bool
    {
        return $step->isTimeless() ?: $step->getEndAt() > (new \DateTime())->format('Y-m-d H:i:s');
    }
}
