<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\EventListener\NoCommentWhenPrivateSubscriber;
use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProposalSelectionVoteType extends AbstractType
{
    private $tokenStorage;
    private $manager;

    public function __construct(TokenStorageInterface $tokenStorage, Manager $manager)
    {
        $this->tokenStorage = $tokenStorage;
        $this->manager = $manager;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($this->tokenStorage->getToken()->getUser() && $this->manager->isActive('vote_without_account')) {
            $builder
                ->add('username', PurifiedTextType::class, [
                    'required' => true,
                ])
                ->add('email',
                    EmailType::class, [
                    'required' => true,
                ])
            ;
        }

        $builder
            ->add('comment', PurifiedTextareaType::class, [
                'required' => false,
                'mapped' => false,
            ])
            ->add('private', null, [
                'required' => false,
            ])
            ->addEventSubscriber(new NoCommentWhenPrivateSubscriber())
        ;
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'Capco\AppBundle\Entity\ProposalSelectionVote',
            'csrf_protection' => false,
        ]);
    }
}
