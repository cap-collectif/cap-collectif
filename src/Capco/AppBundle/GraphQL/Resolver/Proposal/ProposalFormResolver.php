<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Utils\Text;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\HttpFoundation\Request;

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

    public function resolveProposals(ProposalForm $form, Arg $args, $user, Request $request): Connection
    {
        $repo = $this->container->get('capco.proposal.repository');
        $totalCount = 0;

        $paginator = new Paginator(function (int $offset, int $limit) use ($repo,$form, $args, $user, $request, &$totalCount) {
            $filters = [];
            if ($args->offsetExists('district')) {
                $filters['districts'] = $args->offsetGet('district');
            }
            if ($args->offsetExists('theme')) {
                $filters['themes'] = $args->offsetGet('theme');
            }
            if ($args->offsetExists('userType')) {
                $filters['types'] = $args->offsetGet('userType');
            }
            if ($args->offsetExists('category')) {
                $filters['categories'] = $args->offsetGet('category');
            }

            if ($args->offsetExists('affiliations')) {
                $affiliations = $args->offsetGet('affiliations');
                if (in_array('EVALUER', $affiliations, true)) {
                    $direction = $args->offsetGet('orderBy')['direction'];
                    $field = $args->offsetGet('orderBy')['field'];

                    return $repo->getProposalsByFormAndEvaluer($form, $user, $offset, $limit, $field, $direction)->getIterator()->getArrayCopy();
                }
            } else {
                $direction = $args->offsetGet('orderBy')['direction'];
                $field = $args->offsetGet('orderBy')['field'];

                $order = $this->findOrderFromFieldAndDirection($field, $direction);

                $filters['proposalForm'] = $form->getId();
                $filters['collectStep'] = $form->getStep()->getType();

                $seed = method_exists($user, 'getId') ? $user->getId() : $request->getClientIp();

                $results = $this->container->get('capco.search.proposal_search')->searchProposals(
                    $offset,
                    $limit,
                    $order,
                    null,
                    $filters,
                    $seed
                );

                $totalCount = $results['count'];

                return $results['proposals'];
            }
        });

        $totalCount = 'anon.' !== $user ? $repo->countProposalsByFormAndEvaluer($form, $user) : $totalCount;

        $connection = $paginator->auto($args, $totalCount);
        $connection->totalCount = $totalCount;

        return $connection;
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

    public function findOrderFromFieldAndDirection(string $field, string $direction): string
    {
        $order = 'random';

        switch ($field) {
            case 'VOTES':
                if ('ASC' === $direction) {
                    $order = 'least-votes';
                } else {
                    $order = 'votes';
                }
                break;
            case 'CREATED_AT':
                if ('ASC' === $direction) {
                    $order = 'old';
                } else {
                    $order = 'last';
                }
                break;
            case 'COMMENTS':
                $order = 'comments';
                break;
            case 'COST':
                if ('ASC' === $direction) {
                    $order = 'cheap';
                } else {
                    $order = 'expensive';
                }
                break;
        }

        return $order;
    }
}
