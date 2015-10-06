<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Synthesis\Synthesis;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;

class SynthesisAdmin extends Admin
{
    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $projectId = null;

        if ($this->hasParentFieldDescription()) { // this Admin is embedded
            $projectId = $this->getParentFieldDescription()->getAdmin()->getPersistentParameters()['project_id'];
        } else {
            $projectId = $this->getRequest()->get('project_id');
        }

        $formMapper
            ->add('enabled', null, array(
                'label' => 'admin.fields.synthesis.enabled',
                'required' => false,
            ))
            ->add('editable', null, array(
                'label' => 'admin.fields.synthesis.editable',
                'required' => false,
            ))
            ->add('sourceType', 'sonata_type_choice_field_mask', array(
                'label' => 'admin.fields.synthesis.source_type',
                'required' => true,
                'choices' => Synthesis::$sourceTypesLabels,
                'translation_domain' => 'CapcoAppBundleSynthesis',
                'map' => [
                    'none' => ['enabled'],
                    'consultation_step' => ['enabled', 'consultationStep'],
                ],
            ))
            ->add('consultationStep', 'entity', array(
                'label' => 'admin.fields.synthesis.consultation_step',
                'class' => 'CapcoAppBundle:ConsultationStep',
                'query_builder' => $this->createQueryBuilderForConsultationSteps($projectId),
                'required' => false,
                'empty_value' => 'admin.fields.synthesis.consultation_step_empty',
                'help' => 'admin.help.synthesis.consultation_step',
        ));
    }

    public function prePersist($synthesis)
    {
        $this->createOrUpdateFromSource($synthesis);
    }

    public function preUpdate($synthesis)
    {
        $this->createOrUpdateFromSource($synthesis);
    }

    private function createOrUpdateFromSource($synthesis)
    {
        $this->getConfigurationPool()->getContainer()->get('capco.synthesis.synthesis_handler')->createOrUpdateElementsFromSource($synthesis);
    }

    private function createQueryBuilderForConsultationSteps($projectId)
    {
        $qb = $this->modelManager
            ->createQuery('CapcoAppBundle:ConsultationStep', 'cs')
            ->where('cs.isEnabled = :enabled')
            ->setParameter('enabled', true)
        ;

        if ($projectId) {
            $qb
                ->leftJoin('cs.projectAbstractStep', 'cas')
                ->andWhere('cas.project = :projectId')
                ->setParameter('projectId', $projectId)
            ;
        }

        return $qb;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        return $collection->clearExcept(['create', 'edit', 'delete']);
    }

    public function getBatchActions()
    {
        return array();
    }
}
