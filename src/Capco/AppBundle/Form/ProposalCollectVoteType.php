<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Form\EventListener\NoCommentWhenPrivateSubscriber;
use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProposalCollectVoteType extends AbstractType
{
    private $tokenStorage;

    public function __construct(TokenStorageInterface $tokenStorage)
    {
        $this->tokenStorage = $tokenStorage;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        if ($this->tokenStorage->getToken()->getUser()) {
            $builder
                ->add('username',
                    PurifiedTextType::class, [
                    'required' => true,
                ])
                ->add('email',
                    EmailType::class, [
                    'required' => true,
                ])
            ;
        }

        $builder
            ->add('comment',
                PurifiedTextareaType::class, [
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
            'data_class' => 'Capco\AppBundle\Entity\ProposalCollectVote',
            'csrf_protection' => false,
        ]);
    }
}
