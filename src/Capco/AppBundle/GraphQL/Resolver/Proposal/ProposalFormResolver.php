<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Utils\Text;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ProposalFormResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveQuestions(ProposalForm $form): Collection
    {
        return $form->getRealQuestions();
    }

    public function resolveCategories(ProposalForm $form): array
    {
        $categories = $form->getCategories()->toArray();
        usort(
          $categories,
          function ($a, $b) {
              return $a->getName() <=> $b->getName();
          }
      );

        return $categories;
    }

    public function resolveDistricts(ProposalForm $form, string $order): array
    {
        $districts = $form->getDistricts()->toArray();
        if ('ALPHABETICAL' === $order) {
            usort(
                $districts,
                function ($a, $b) {
                    return $a->getName() <=> $b->getName();
                }
            );
        }

        return $districts;
    }

    public function resolveProposals(ProposalForm $form, Arg $args, User $user): Connection
    {
        $repo = $this->container->get('capco.proposal.repository');
        $paginator = new Paginator(function (int $offset, int $limit) use ($repo, $form, $args, $user) {
            if ($args->offsetExists('affiliations')) {
                $affiliations = $args->offsetGet('affiliations');
                if (in_array('EVALUER', $affiliations, true)) {
                    $direction = $args->offsetGet('orderBy')['direction'];
                    $field = $args->offsetGet('orderBy')['field'];

                    return $repo->getProposalsByFormAndEvaluer($form, $user, $offset, $limit, $field, $direction)->getIterator()->getArrayCopy();
                }
            }
            throw new UserError('Not implemented');
        });

        $totalCount = $repo->countProposalsByFormAndEvaluer($form, $user);

        return $paginator->auto($args, $totalCount);
    }

    public function resolveAll(): array
    {
        return $this->container->get('capco.proposal_form.repository')->findAll();
    }

    public function resolveSummaryHelpText(ProposalForm $proposalForm)// : ?string
    {
        $text = $proposalForm->getSummaryHelpText();

        return $text ? Text::htmlToString($text) : null;
    }

    public function resolveUrl(ProposalForm $proposalForm): string
    {
        $step = $proposalForm->getStep();

        if (!$step) {
            return '';
        }

        $project = $step->getProject();
        if (!$project) {
            return '';
        }

        return $this->container->get('router')->generate('app_project_show_collect',
            [
                'projectSlug' => $project->getSlug(),
                'stepSlug' => $step->getSlug(),
            ], true);
    }
}
