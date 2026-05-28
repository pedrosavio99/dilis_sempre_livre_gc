import { useState, useEffect } from 'react'
import { useEventoConfig } from '../../hooks/useEventoConfig'
import { useToast } from '../../hooks/useToast.jsx'
import { getBrindesDisponiveis, cadastrarLead } from '../../services/api'
import ModalConfirm from '../admin/ModalConfirm'

function aplicarMascaraTelefone(valor) {
  const nums = valor.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 10)
    return nums.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  return nums.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}

function SkeletonLead() {
  return (
    <>
      <div className="skeleton skeleton-input" style={{ marginBottom: 16 }} />
      <div className="skeleton skeleton-input" style={{ marginBottom: 16 }} />
      <div className="skeleton skeleton-input" style={{ marginBottom: 16 }} />
      <div className="skeleton skeleton-input" style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0 }} />
        <div className="skeleton skeleton-text" style={{ flex: 1, marginBottom: 0 }} />
      </div>
      <div className="skeleton skeleton-btn" style={{ marginBottom: 8 }} />
      <div className="skeleton skeleton-btn" style={{ opacity: 0.4 }} />
    </>
  )
}

function ModalTermos({ onFechar }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onFechar}
    >
      <div
        style={{
          background: 'var(--bg-card, #fff)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border, #eee)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}>
          <strong style={{ fontSize: '1rem', lineHeight: 1.4, flex: 1 }}>Termo de Autorização de Uso de Imagem e Dados</strong>
          <button
            onClick={onFechar}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', color: 'var(--text-muted, #888)',
              flexShrink: 0, padding: 0,
            }}
          >X</button>
        </div>

        <div style={{ padding: '16px 20px', overflowY: 'auto', fontSize: '0.85rem', lineHeight: 1.6 }}>
          <p>
            Eu ("AUTORIZADOR"), abaixo assinado, concedo à empresa <strong>Batuque Promoção, Eventos e Marketing Promocional LTDA</strong> (Batuque Promo), com sede na Rua Gomes de Carvalho, 1666 — Vila Olímpia — CEP 04.547-006 — São Paulo/SP, CNPJ: 00.946.790/0001-00, autorização em caráter gratuito para captar, fixar e usar meus direitos de imagem (nome, apelido, imagem, voz, demais características físicas, entrevistas e depoimentos), captados durante minha participação nas ativações da patrocinadora <strong>Sempre Livre</strong>, pertencente à <strong>JNTL CONSUMER HEALTH (BRAZIL) LTDA</strong>, CNPJ: 45.694.447/0001-46, nos eventos de São João em Caruaru e Campina Grande, no período de 30 de maio de 2026 a 05 de julho de 2026.
          </p>

          <p><strong>1.</strong> A JNTL poderá utilizar o material livremente, podendo adaptá-lo para produções audiovisuais, peças publicitárias e materiais promocionais em qualquer mídia existente ou futura (televisão, internet, redes sociais, etc.), inclusive para fins comerciais.</p>

          <p><strong>2.</strong> Desta autorização não caberá qualquer remuneração ou compensação ao Autorizador.</p>

          <p><strong>3.</strong> A utilização não tem limitação de tempo ou número de vezes, podendo ocorrer no Brasil e/ou no exterior.</p>

          <p><strong>4.</strong> O Autorizador renuncia ao direito de aprovação prévia do material final.</p>

          <p><strong>5.</strong> O Autorizador fica impedido de utilizar quaisquer materiais oriundos do Projeto sem prévia autorização escrita da JNTL.</p>

          <p><strong>6.</strong> Todos os dados pessoais coletados serão tratados de acordo com a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>, utilizados apenas para as finalidades descritas neste termo.</p>

          <p><strong>7.</strong> Esta autorização é firmada em caráter gratuito, irrevogável e irretratável.</p>

          <p><strong>8.</strong> O Autorizador declara ter ciência de todas as condições aqui constantes e que não há impedimento legal, religioso, moral ou pessoal para assinar esta Autorização.</p>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border, #eee)' }}>
          <button onClick={onFechar} style={{ width: '100%' }}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

export default function LeadScreen({ onSucesso, onNovaConfig }) {
  const { getConfig, limparConfig } = useEventoConfig()
  const { toast, ToastContainer }   = useToast()
  const config = getConfig()

  const [brindes, setBrindes]               = useState([])
  const [loadingBrindes, setLoadingBrindes] = useState(true)
  const [nome, setNome]         = useState('')
  const [email, setEmail]       = useState('')
  const [telefone, setTelefone] = useState('')
  const [brindeId, setBrindeId] = useState('')
  const [termos, setTermos]     = useState(false)
  const [erros, setErros]       = useState({})
  const [loading, setLoading]   = useState(false)
  const [confirmNovaConfig, setConfirmNovaConfig] = useState(false)
  const [modalTermos, setModalTermos] = useState(false)

  useEffect(() => { carregarBrindes() }, [])

  async function carregarBrindes() {
    setLoadingBrindes(true)
    try {
      const data = await getBrindesDisponiveis()
      setBrindes(data)
    } catch {
      toast.erro('Erro ao carregar brindes. Tente novamente.')
    } finally {
      setLoadingBrindes(false)
    }
  }

  function limparFormulario() {
    setNome(''); setEmail(''); setTelefone('')
    setBrindeId(''); setTermos(false); setErros({})
  }

  function limparErro(campo) {
    setErros(p => ({ ...p, [campo]: '' }))
  }

  function handleTelefone(e) {
    setTelefone(aplicarMascaraTelefone(e.target.value))
    limparErro('telefone')
  }

  function validar() {
    const e = {}
    if (!nome || nome.length < 3)
      e.nome = 'Informe o nome completo (mínimo 3 caracteres).'
    if (!email || !email.includes('@') || !email.includes('.'))
      e.email = 'Informe um e-mail válido.'
    const tel = telefone.replace(/\D/g, '')
    if (!tel)
      e.telefone = 'Informe o telefone com DDD.'
    else if (tel.length < 10 || tel.length > 11)
      e.telefone = 'Telefone inválido. Use DDD + número.'
    if (!brindeId) e.brinde = 'Selecione um brinde.'
    if (!termos)   e.termos = 'Aceite os termos de uso para continuar.'
    setErros(e)
    return Object.keys(e).length === 0
  }

  async function handleCadastrar() {
    if (!validar()) return
    setLoading(true)
    try {
      const tel = telefone.replace(/\D/g, '')
      const result = await cadastrarLead({
        nome, email, telefone: tel,
        brindeId: parseInt(brindeId),
        aceiteTermos: termos,
        promotora: config.promotora,
        cidade: config.cidade,
        ativacao: config.ativacao,
      })
      onSucesso({ ...result.lead, config })
    } catch (e) {
      toast.erro(e.message || 'Erro ao realizar cadastro.')
      await carregarBrindes()
    } finally {
      setLoading(false)
    }
  }

  function handleConfirmarNovaConfig() {
    setConfirmNovaConfig(false)
    limparConfig()
    limparFormulario()
    onNovaConfig()
  }

  const inputStyle = (campo) =>
    erros[campo] ? { borderColor: 'var(--danger)', marginBottom: 4 } : {}

  return (
    <>
      <ToastContainer />

      {modalTermos && <ModalTermos onFechar={() => setModalTermos(false)} />}

      {config && (
        <div className="topInfo">
          <strong>{config.promotora}</strong>
          <br />
          {config.cidade}&nbsp;&nbsp;·&nbsp;&nbsp;{config.ativacao}
        </div>
      )}

      <h1>Cadastro do participante</h1>
      <p className="subtitle">Preencha os dados para receber o brinde</p>

      {loadingBrindes ? <SkeletonLead /> : (
        <>
          <div className="form-group">
            <input
              type="text" placeholder="Nome completo" value={nome}
              onChange={e => { setNome(e.target.value); limparErro('nome') }}
              style={inputStyle('nome')}
            />
            {erros.nome && <div className="field-error">{erros.nome}</div>}
          </div>

          <div className="form-group">
            <input
              type="email" placeholder="E-mail" value={email}
              onChange={e => { setEmail(e.target.value); limparErro('email') }}
              style={inputStyle('email')}
            />
            {erros.email && <div className="field-error">{erros.email}</div>}
          </div>

          <div className="form-group">
            <input
              type="tel" placeholder="(00) 00000-0000" value={telefone}
              onChange={handleTelefone}
              style={inputStyle('telefone')}
            />
            {erros.telefone && <div className="field-error">{erros.telefone}</div>}
          </div>

          <div className="form-group">
            <select
              value={brindeId}
              onChange={e => { setBrindeId(e.target.value); limparErro('brinde') }}
              style={inputStyle('brinde')}
            >
              <option value="">Selecione o brinde</option>
              {brindes.map(b => (
                <option key={b.id} value={b.id}>
                  {b.nome} ({b.quantidadeDisponivel} disponíveis)
                </option>
              ))}
            </select>
            {erros.brinde && <div className="field-error">{erros.brinde}</div>}
          </div>

          <div className="form-group">
            <div className="checkbox">
              <input
                type="checkbox" id="termos" checked={termos}
                onChange={e => { setTermos(e.target.checked); limparErro('termos') }}
              />
              <label htmlFor="termos">
                Aceito os{' '}
                <span
                  onClick={() => setModalTermos(true)}
                  style={{
                    color: 'var(--primary, #007bff)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  termos de uso
                </span>
                {' '}e declaro que os dados são verdadeiros
              </label>
            </div>
            {erros.termos && <div className="field-error" style={{ marginTop: 4 }}>{erros.termos}</div>}
          </div>

          <button onClick={handleCadastrar} disabled={loading}>
            {loading ? 'Processando...' : 'Finalizar cadastro'}
          </button>
          <button
            onClick={() => setConfirmNovaConfig(true)}
            className="btn-secondary"
            disabled={loading}
          >
            Nova configuração
          </button>
        </>
      )}

      {confirmNovaConfig && (
        <ModalConfirm
          mensagem="Tem certeza que deseja reiniciar a configuração? Os dados já cadastrados serão mantidos no sistema."
          onConfirmar={handleConfirmarNovaConfig}
          onCancelar={() => setConfirmNovaConfig(false)}
        />
      )}
    </>
  )
}