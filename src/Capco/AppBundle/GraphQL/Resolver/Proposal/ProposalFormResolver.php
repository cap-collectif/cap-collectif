<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Utils\Text;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
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
        $filters = [];
        $term = null;
        if ($args->offsetExists('term')) {
            $term = $args->offsetGet('term');
        }

        if ($form->getStep()->isPrivate()) {
            if (!$user instanceof User) {
                $connection = ConnectionBuilder::connectionFromArray([], $args);
                $connection->totalCount = 0;
                $connection->{'fusionCount'} = 0;

                return $connection;
            }
            if (!$user->isAdmin()) {
                // When the step is private, only an author or an admin can see proposals
                $filters['author'] = $user->getId();
            }
        }
        $paginator = new Paginator(function (int $offset, int $limit) use ($repo, $form, $args, $user, $term, $request, &$totalCount, $filters) {
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
            if ($args->offsetExists('status')) {
                $filters['statuses'] = $args->offsetGet('status');
            }

            if ($args->offsetExists('affiliations')) {
                $affiliations = $args->offsetGet('affiliations');
                if (in_array('EVALUER', $affiliations, true)) {
                    $direction = $args->offsetGet('orderBy')['direction'];
                    $field = $args->offsetGet('orderBy')['field'];

                    $totalCount = $user instanceof User ? $repo->countProposalsByFormAndEvaluer($form, $user) : $totalCount;

                    return $repo->getProposalsByFormAndEvaluer($form, $user, $offset, $limit, $field, $direction)->getIterator()->getArrayCopy();
                }

                if (in_array('OWNER', $affiliations, true)) {
                    $filters['author'] = $user->getId();
                }
            }

            $direction = $args->offsetGet('orderBy')['direction'];
            $field = $args->offsetGet('orderBy')['field'];

            $order = self::findOrderFromFieldAndDirection($field, $direction);

            $filters['proposalForm'] = $form->getId();
            $filters['collectStep'] = $form->getStep()->getType();

            $seed = $user instanceof User ? $user->getId() : $request->getClientIp();

            $results = $this->container->get('capco.search.proposal_search')->searchProposals(
                    $offset,
                    $limit,
                    $order,
                    $term,
                    $filters,
                    $seed
                );

            $totalCount = $results['count'];

            return $results['proposals'];
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->totalCount = $totalCount;

        $countFusions = $repo->countFusionsByProposalForm($form);
        $connection->{'fusionCount'} = $countFusions;

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

    public static function findOrderFromFieldAndDirection(string $field, string $direction): string
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
