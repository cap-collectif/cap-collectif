<?php

namespace Capco\UserBundle\Form\Type;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

class MemberSearchType extends AbstractType
{
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('sort', 'choice', [
                'required'           => false,
                'choices'            => User::$sortOrderLabels,
                'translation_domain' => 'CapcoAppBundle',
                'label'              => 'user.index.sort.label',
                'empty_value'        => false,
                'attr'               => ['onchange' => 'this.form.submit()'],
            ])
        ;

        if ($this->toggleManager->isActive('user_type')) {
            $builder->add('userType', 'entity', [
                'required'           => false,
                'class'              => 'CapcoUserBundle:UserType',
                'property'           => 'name',
                'label'              => 'user.index.user_type.label',
                'translation_domain' => 'CapcoAppBundle',
                'empty_value'        => 'user.index.user_type.all_types',
                'attr'               => ['onchange' => 'this.form.submit()'],
            ]);
        }
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_search_members';
    }
}
