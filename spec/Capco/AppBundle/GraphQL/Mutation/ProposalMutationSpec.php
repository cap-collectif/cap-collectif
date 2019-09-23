<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\ProposalAdminType;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalLikersDataLoader;
use Capco\AppBundle\GraphQL\Mutation\ProposalMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactory;
use PhpSpec\ObjectBehavior;

class ProposalMutationSpec extends ObjectBehavior
{
    public function let(
        LoggerInterface $logger,
        ProposalLikersDataLoader $proposalLikersDataLoader,
        GlobalIdResolver $globalIdResolver,
        Publisher $publisher,
        Container $container
    ) {
        $this->beConstructedWith(
            $logger,
            $proposalLikersDataLoader,
            $globalIdResolver,
            $publisher,
            $container
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalMutation::class);
    }

    public function it_published_a_proposal_draft(
        Argument $input,
        User $author,
        EntityManagerInterface $em,
        FormFactory $formFactory,
        Proposal $proposal,
        Form $form,
        Indexer $indexer,
        Publisher $publisher,
        ProposalForm $proposalForm,
        Container $container,
        GlobalIdResolver $globalIdResolver,
        Manager $manager,
        $wasDraft = true
    ) {
        $this->setContainer($container);

        $values = [];
        $values['id'] = 'UHJvcG9zYWwscHJvcG9zYWwyMQ==';
        $values['draft'] = false;
        $values['title'] = 'new title';
        $values['author'] = 'VXNlcix1c2VyNTAx';
        $user = $author;
        $container->get('doctrine.orm.default_entity_manager')->willReturn($em);
        $container->get(Manager::class)->willReturn($manager);

        $author->getId()->willReturn('user501');
        $author->getUsername()->willReturn('aUser');
        $author->isEmailConfirmed()->willReturn(true);
        $author->isAdmin()->willReturn(false);

        $input->getArrayCopy()->willReturn($values);

        $proposal->getId()->willReturn('proposal21');
        $proposal->isDraft()->willReturn(true);
        $proposal->getAuthor()->willReturn($author);
        $proposal->getPublishedAt()->willReturn(null);
        $proposal->isTrashed()->willReturn(false);
        $proposal->getTitle()->willReturn('Proposal in draft');
        $proposal->canContribute($user)->willReturn(true);
        $proposal->setUpdateAuthor($author)->shouldBeCalled();
        $proposal->getUpdateAuthor()->willReturn($author);

        $proposal->getProposalForm()->willReturn($proposalForm);

        $globalIdResolver->resolve($values['id'], $user)->willReturn($proposal);

        // we set the proposal as non draft
        $proposal->setDraft(false)->shouldBeCalled();
        $proposal->setPublishedAt(\Prophecy\Argument::type(\DateTime::class))->shouldBeCalled();

        $container->get('form.factory')->willReturn($formFactory);
        $container->get(Indexer::class)->willReturn($indexer);
        $container->get('swarrot.publisher')->willReturn($publisher);

        $formFactory
            ->create(ProposalAdminType::class, $proposal, [
                'proposalForm' => $proposalForm,
                'validation_groups' => ['Default']
            ])
            ->willReturn($form);

        $form
            ->submit(
                [
                    'title' => 'new title'
                ],
                false
            )
            ->willReturn(null);
        $form->isValid()->willReturn(true);
        $form->remove('author')->shouldBeCalled();

        $em->flush()->shouldBeCalled();

        $indexer->index(\get_class($proposal->getWrappedObject()), 'proposal21')->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $this->changeContent($input, $user)->shouldBe(['proposal' => $proposal]);
    }
}
