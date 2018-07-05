<?php
namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Search\ProposalSearch;
use Capco\UserBundle\Entity\User;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ProposalFormProposalsResolver implements ResolverInterface
{
    private $proposalRepo;
    private $proposalSearch;
    private $container;

    public function __construct(
        ProposalRepository $proposalRepo,
        ProposalSearch $proposalSearch,
        ContainerInterface $container
    ) {
        $this->proposalRepo = $proposalRepo;
        $this->proposalSearch = $proposalSearch;
        $this->container = $container;
    }

    public function __invoke(
        ProposalForm $form,
        Arg $args,
        $viewer,
        RequestStack $request
    ): Connection {
        $totalCount = 0;
        $filters = [];
        $term = null;
        if ($args->offsetExists('term')) {
            $term = $args->offsetGet('term');
        }

        $emptyConnection = ConnectionBuilder::connectionFromArray([], $args);
        $emptyConnection->totalCount = 0;
        $emptyConnection->{'fusionCount'} = 0;

        if (!$form->getStep()) {
            return $emptyConnection;
        }

        if ($form->getStep()->isPrivate()) {
            // The step is private
            // only an author or an admin can see proposals

            // If viewer is not authentiated we return an empty connection
            if (!$viewer instanceof User) {
                return $emptyConnection;
            }

            // If viewer is asking for proposals of someone else we return an empty connection
            if ($args->offsetExists('author') && $viewer->getId() !== $args->offsetGet('author')) {
                if (!$viewer->isAdmin()) {
                    return $emptyConnection;
                }
                $filters['author'] = $args->offsetGet('author');
            } else {
                if (!$viewer->isAdmin()) {
                    // When the step is private, only an author or an admin can see proposals
                    $filters['author'] = $viewer->getId();
                }
            }
        } else {
            if ($args->offsetExists('author')) {
                $filters['author'] = $args->offsetGet('author');
            }
        }
        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $form,
            $args,
            $viewer,
            $term,
            $request,
            &$totalCount,
            $filters
        ) {
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
                if (\in_array('EVALUER', $affiliations, true)) {
                    $direction = $args->offsetGet('orderBy')['direction'];
                    $field = $args->offsetGet('orderBy')['field'];

                    $totalCount =
                        $viewer instanceof User
                            ? $this->proposalRepo->countProposalsByFormAndEvaluer($form, $viewer)
                            : $totalCount;

                    return $this->proposalRepo->getProposalsByFormAndEvaluer(
                        $form,
                        $viewer,
                        $offset,
                        $limit,
                        $field,
                        $direction
                    )
                        ->getIterator()
                        ->getArrayCopy();
                }

                if (\in_array('OWNER', $affiliations, true)) {
                    $filters['author'] = $viewer->getId();
                }
            }

            $direction = $args->offsetGet('orderBy')['direction'];
            $field = $args->offsetGet('orderBy')['field'];

            $order = self::findOrderFromFieldAndDirection($field, $direction);

            $filters['proposalForm'] = $form->getId();
            $filters['collectStep'] = $form->getStep()->getId();

            if ($viewer instanceof User) {
                $seed = $viewer->getId();
            } elseif ($request->getCurrentRequest()) {
                $seed = $request->getCurrentRequest()->getClientIp();
            } else {
                $seed = substr(md5(mt_rand()), 0, 10);
            }

            $results = $this->proposalSearch->searchProposals(
                $offset,
                $limit,
                $order,
                $term,
                $filters,
                $seed
            );

            $totalCount = $results['count'];
            $ids = array_map(function (Proposal $proposal) {
                return $proposal->getId();
            }, $results['proposals']);

            return $this->container->get('proposals_loader')->loadMany($ids);
        },
        Paginator::MODE_PROMISE);

        $connection = $paginator->auto($args, $totalCount);
        $connection->totalCount = $totalCount;

        $countFusions = $this->proposalRepo->countFusionsByProposalForm($form);
        $connection->{'fusionCount'} = $countFusions;

        return $connection;
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
