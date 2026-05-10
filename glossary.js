// glossary.js — Accordion woordenlijst

(function () {
  const terms = [
    {
      word: 'Neuron',
      def: 'Een hersencel. Je hebt er zo\'n 86 miljard in je brein. Ze sturen informatie naar elkaar via elektrische en chemische signalen — een soort biologisch internet in je hoofd.'
    },
    {
      word: 'Dendriet',
      def: 'De vertakte "armen" van een hersencel die signalen ontvangen van andere cellen. Hoe meer dendrieten en hoe meer vertakkingen, hoe meer verbindingen een cel kan maken. Ze zijn microscopisch klein — daarom was dit onderzoek zo moeilijk.'
    },
    {
      word: 'Myeline',
      def: 'De isolatielaag rondom zenuwbanen, net als het plastic om een elektriciteitskabel. Myeline zorgt ervoor dat elektrische signalen snel en netjes reizen. Bij MS valt het immuunsysteem deze laag aan, waardoor signalen "lekken" of vertragen.'
    },
    {
      word: 'Demyelinisatie',
      def: 'Het proces waarbij myeline wordt beschadigd of vernietigd — dit is het kernprobleem bij MS. Als myeline weg is, werken de zenuwbanen niet meer goed. Soms herstelt het gedeeltelijk (remyelinisatie), maar bij progressieve MS raakt het zenuwweefsel zelf beschadigd.'
    },
    {
      word: 'Actie­potentiaal',
      def: 'Een elektrisch "schot" dat een hersencel afvuurt als hij genoeg gestimuleerd is. Het is een digitaal aan/uit-signaal: de cel schiet of hij schiet niet. Hoe snel een cel schiet en hoe vaak achter elkaar bepaalt welke boodschap er wordt doorgegeven.'
    },
    {
      word: 'Burst',
      def: 'Een serie van meerdere actiepotentialen kort achter elkaar — een soort "SOS-signaal". Uit dit onderzoek blijkt dat bursts veel betrouwbaarder doordringen tot in verre dendrieten dan losse signalen.'
    },
    {
      word: 'Calcium (Ca²⁺)',
      def: 'Een mineraal dat als boodschapper in je hersencellen werkt. Calcium stroomt naar binnen als reactie op elektrische activiteit en zet processen in gang zoals leren en geheugenopslag. Maar teveel calcium is giftig voor cellen — een evenwicht dat bij MS verstoord kan raken.'
    },
    {
      word: 'Backpropagatie',
      def: 'Het reizen van een signaal terug van het cellichaam de dendrieten in. Normaal reizen signalen van dendrieten naar het cellichaam. Backpropagatie gaat de andere kant op en speelt een rol bij hoe cellen "leren" — dendriten ontvangen dan feedback van het cellichaam over wat er net is gebeurd.'
    },
    {
      word: 'Voltage-imaging',
      def: 'Een techniek waarbij fluorescerende eiwitten worden gebruikt die oplichten als er een elektrisch signaal door een cel gaat. Met een speciale microscoop kunnen onderzoekers dan live zien waar en wanneer cellen vuren — voor het eerst ook in levende dieren en in dendrieten.'
    },
    {
      word: 'CA1 neuron',
      def: 'Een specifiek type hersencel in de hippocampus — het geheugencentrum van je brein. CA1-neuronen spelen een sleutelrol bij het opslaan van herinneringen en ruimtelijk denken. Ze werden in dit onderzoek bestudeerd omdat ze mooie lange dendrieten hebben.'
    },
    {
      word: 'Neuroprotectie',
      def: 'Het beschermen van zenuwcellen tegen schade of verlies. De huidige MS-medicijnen remmen vooral het immuunsysteem (immunomodulatie). Neuroprotectie is een aparte doelstelling: cellen in leven houden ook als er al ontsteking is. Hiervoor zijn nog weinig effectieve middelen.'
    },
    {
      word: 'Hippocampus',
      def: 'Hersenstructuur in de vorm van een zeepaardje (hippocampus = Grieks voor zeepaard) die essentieel is voor geheugen en leren. Cognitieve klachten bij MS — "hersenmist", vergeetachtigheid — hangen deels samen met schade aan of rondom de hippocampus.'
    }
  ];

  const container = document.getElementById('glossary');
  if (!container) return;

  for (const term of terms) {
    const item = document.createElement('div');
    item.className = 'glossary-item';

    const btn = document.createElement('button');
    btn.className = 'glossary-trigger';
    btn.innerHTML = `${term.word} <span class="glossary-arrow">›</span>`;

    const body = document.createElement('div');
    body.className = 'glossary-body';
    body.textContent = term.def;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.glossary-item.open').forEach(el => el.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });

    item.appendChild(btn);
    item.appendChild(body);
    container.appendChild(item);
  }
})();
