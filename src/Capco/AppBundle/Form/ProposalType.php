<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Form\Type\PurifiedTextareaType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Toggle\Manager;
use Infinite\FormBundle\Form\Type\PolyCollectionType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Valid;

class ProposalType extends AbstractType
{
    protected $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $isDraft = $builder->getData()->isDraft();
        $form = $options['proposalForm'];
        if (!$form) {
            throw new \Exception('A proposal form is needed to create or update a proposal.');
        }

        $builder
            ->add('title', PurifiedTextType::class, ['required' => true])
            ->add('summary', PurifiedTextareaType::class, ['required' => false])
            ->add('body', PurifiedTextareaType::class, ['required' => $isDraft])
        ;

        if ($this->toggleManager->isActive('themes') && $form->isUsingThemes()) {
            $builder->add('theme');
        }

        if ($form->isUsingCategories()) {
            $builder->add('category');
        }

        if ($this->toggleManager->isActive('districts') && $form->isUsingDistrict()) {
            $builder->add('district');
        }

        if ($form->getUsingAddress()) {
            $builder->add('address', TextType::class);
        }

        $builder
            ->add('responses', PolyCollectionType::class, [
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
                'index_property' => 'position',
                'types' => [
                    ValueResponseType::class,
                    MediaResponseType::class,
                ],
                'type_name' => AbstractResponse::TYPE_FIELD_NAME,
            ])
        ;

        $builder->add('media');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Proposal::class,
            'csrf_protection' => false,
            'translation_domain' => false,
            'constraints' => new Valid(),
            'proposalForm' => null,
        ]);
    }
}
